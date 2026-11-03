/**
 * Product ranking: scores every product so the most attractive come first, and hides
 * the weakest. Used by `npm run score`, by the catalogue import, and on every deploy.
 *
 * The score blends: category, product type, supplier best-seller flag, festive flag,
 * how big the deal looks (MRP vs our price), and photo count. Look-alike products (colour
 * variants, same item under another name) and long runs of one product type are pushed
 * down so pages look varied. The admin's "Always show" / "Always hide" always wins.
 *
 * Expects an open Mongoose connection.
 */
import mongoose from "mongoose";
import { ProductModel } from "../../src/models/Product";
import { PRICE_TIERS } from "../../src/lib/pricing";

export type ScoreOptions = {
  /** Print the ranking without saving. */
  dryRun?: boolean;
  /** Most products kept visible per price tier. */
  keep?: number;
  /** Print the top/bottom of the ranking and counts. */
  verbose?: boolean;
  /** Also print hidden products in this category. */
  showHidden?: string;
};

// Anything whose quality score is below this is hidden even if its price section has room.
const MIN_SCORE = 30;

const CATEGORY_WEIGHT: Record<string, number> = {
  "Home Décor": 30,
  "Lighting & Candles": 30,
  "Pooja Essentials": 28,
  "Festive Gifting": 28,
  "Dining & Serveware": 22,
  Planters: 20,
  "Drinkware & Bar": 18,
  "Cushions & Textiles": 14,
  Accessories: 10,
  "Kitchen & Storage": 6,
  "Kids & Play": 0,
  "Lunch Boxes & Bottles": 0,
  "Bath & Organisers": -15,
};

// Matched against "<supplier product type> <title>", lower-cased. First matching weights all add up.
const KEYWORDS: [RegExp, number][] = [
  // festive and gift-worthy
  [/\b(diya|diyas|deepak|lantern|kandil|toran|rangoli|urli|tealight|tea light|t-light)\b/, 18],
  [/\b(ganesh|ganesha|lakshmi|laxmi|krishna|buddha|idol|devotion|pooja|puja|thali|kalash|shubh|om)\b/, 14],
  [/\b(brass|marble|hand[- ]?painted|handcrafted|gold(en)?|metallic|gilded)\b/, 8],
  [/\b(gift|hamper|festive|diwali)\b/, 8],
  [/\b(candle|candle holder|votive|diffuser|vase|curio|figurine|sculpture|showpiece|wall (decor|décor|decoration|plate|art)|mirror|clock|jewell?ery box|decorative)\b/, 10],
  [/\b(lamp|pendant|chandelier|fairy light|string light)\b/, 8],
  [/\b(platter|cake stand|serving|tray|dinner set|tea set|cup (and|&) saucer|bowl set|chip ?(and|&) ?dip|cheese board)\b/, 6],
  [/\b(planter|pot)\b/, 4],
  // everyday or utility items that look cheap in a gift shop
  [/\b(organiser|organizer|orangiser|storage bag|shoe|underwear|sock|lingerie|toiletr(y|ies)|makeup pouch|cosmetic bag|travel kit|laundry|drying rack|hanger|headband|wristband)\b/, -30],
  [/\b(lunch box|tiffin|bento|water bottle|sipper|kids lunch)\b/, -12],
  [/\b(mesh|refill|spare|replacement|scrubber|scrub|mop|brush|cleaning|lint|wiper|sponge|peeler|grater|strainer|whisk|tongs|spatula|ladle|kitchen tool|squeezer|opener)\b/, -18],
  [/\b(floor mat|door mat|bath mat|shower|soap|toilet)\b/, -12],
  [/\b(tote bag|pouch|zip(per)? bag)\b/, -10],
];

const COLOURS =
  /\b(beige|grey|gray|pink|blue|navy|black|white|green|red|yellow|orange|purple|brown|gold|golden|silver|multicolou?r|ivory|cream|teal|maroon|mustard|olive|peach|lilac|lavender|rust|tan|copper|rose|sage|mint|coral|aqua|turquoise|light|dark|small|medium|large|mini|big)\b/g;

type Row = {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  price: number;
  discountedPrice: number;
  stock: number;
  bestseller?: boolean;
  festive?: boolean;
  images?: { previews?: string[] };
  source?: { type?: string };
  visibility?: "auto" | "show" | "hide";
  score?: number;
  hidden?: boolean;
};

function baseScore(p: Row) {
  const text = `${p.source?.type ?? ""} ${p.title}`.toLowerCase();
  let s = CATEGORY_WEIGHT[p.category] ?? 0;
  for (const [re, w] of KEYWORDS) if (re.test(text)) s += w;
  if (p.bestseller) s += 25;
  if (p.festive) s += 8;
  const ratio = p.price / Math.max(1, p.discountedPrice);
  s += Math.min(3.5, Math.max(0, Math.log2(ratio))) * 6; // bigger visible saving, up to +21
  const photos = p.images?.previews?.length ?? 0;
  if (photos < 4) s -= 25;
  if (p.stock <= 0) s -= 100;
  return s;
}

const STOP = new Set(["and", "with", "for", "in", "of", "set", "the", "a", "to", "cm", "ml"]);

/** Meaningful title words (no colours, sizes, numbers), to spot look-alike products. */
const words = (p: Row) =>
  new Set(
    p.title
      .toLowerCase()
      .replace(COLOURS, " ")
      .split(/[^a-z]+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );

function overlap(a: Set<string>, b: Set<string>) {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / Math.max(1, a.size + b.size - shared); // Jaccard: shared / all distinct words
}

export async function scoreCatalog({ dryRun = false, keep = 400, verbose = false, showHidden }: ScoreOptions = {}) {
  const rows = (await ProductModel.find({})
    .select("title category price discountedPrice stock bestseller festive visibility score hidden images.previews source.type")
    .lean()) as unknown as Row[];

  const ranked = rows.map((p) => ({ p, base: baseScore(p), score: 0, hidden: false, why: "" })).sort((a, b) => b.base - a.base);

  // Spread things out: each further product of the same type loses a little (capped),
  // each look-alike already ranked above costs more, and a product with 4+ look-alikes
  // above it (usually colour variants) is hidden. This only changes the order; whether a
  // product is shown at all depends on its quality score (base) below.
  const seen = new Map<string, Set<string>[]>();
  for (const r of ranked) {
    const type = (r.p.source?.type || r.p.category).toLowerCase();
    const before = seen.get(type) ?? [];
    const w = words(r.p);
    const lookAlikes = before.filter((o) => overlap(w, o) >= 0.6).length;
    before.push(w);
    seen.set(type, before);
    r.score = Math.round(r.base - Math.min(before.length - 1, 12) * 2.5 - lookAlikes * 12);
    if (lookAlikes >= 4) {
      r.hidden = true;
      r.why = "look-alike";
    }
  }
  ranked.sort((a, b) => b.score - a.score);

  // Keep the best keep of each price (if they score well enough); hide the rest.
  const byQuality = [...ranked].sort((a, b) => b.base - a.base);
  for (const tier of PRICE_TIERS) {
    let kept = 0;
    for (const r of byQuality) {
      if (r.p.discountedPrice !== tier || r.hidden || r.p.visibility === "show") continue;
      if (kept < keep && r.p.stock > 0 && r.base >= MIN_SCORE) kept++;
      else {
        r.hidden = true;
        r.why = r.p.stock <= 0 ? "sold out" : r.base < MIN_SCORE ? "low score" : "tier full";
      }
    }
  }

  // The admin's "Always show" / "Always hide" wins over the ranking.
  for (const r of ranked) {
    if (r.p.visibility === "show") (r.hidden = false), (r.why = "");
    if (r.p.visibility === "hide") (r.hidden = true), (r.why = "admin");
  }

  const visible = ranked.filter((r) => !r.hidden);
  const line = (r: (typeof ranked)[number]) =>
    `${String(r.score).padStart(4)} ₹${r.p.discountedPrice} [${r.p.category}] ${r.p.title} (${r.p.source?.type ?? "-"})`;
  if (verbose) {
    console.log(`\nTop 40 of ${visible.length} visible:`);
    visible.slice(0, 40).forEach((r) => console.log(line(r)));
    console.log("\nLowest 15 still visible:");
    visible.slice(-15).forEach((r) => console.log(line(r)));
    console.log("\nVisible by tier:", PRICE_TIERS.map((t) => `₹${t}: ${visible.filter((r) => r.p.discountedPrice === t).length}`).join(", "));
    const byCat = new Map<string, [number, number]>();
    for (const r of ranked) {
      const c = byCat.get(r.p.category) ?? [0, 0];
      c[r.hidden ? 1 : 0]++;
      byCat.set(r.p.category, c);
    }
    console.log("\nCategory: visible / hidden");
    for (const [c, [v, h]] of [...byCat].sort((a, b) => b[1][0] - a[1][0])) console.log(`  ${c}: ${v} / ${h}`);
    const reasons = ranked.filter((r) => r.hidden).reduce<Record<string, number>>((m, r) => ((m[r.why] = (m[r.why] ?? 0) + 1), m), {});
    console.log("Hidden because:", reasons);

    if (showHidden) {
      const cat = showHidden;
      console.log(`\nHidden in ${cat}:`);
      ranked.filter((r) => r.hidden && r.p.category === cat).slice(0, 25).forEach((r) => console.log(`${line(r)} — ${r.why}`));
    }
  }

  if (dryRun) {
    console.log("\nDry run: nothing saved.");
  } else {
    // Only write products whose score or visibility actually changed.
    const ops = ranked
      .filter((r) => r.p.score !== r.score || Boolean(r.p.hidden) !== r.hidden)
      .map((r) => ({
        updateOne: { filter: { _id: r.p._id }, update: { $set: { score: r.score, hidden: r.hidden } } },
      }));
    for (let i = 0; i < ops.length; i += 500) await ProductModel.bulkWrite(ops.slice(i, i + 500), { ordered: false });
    console.log(`Product ranking: ${visible.length} of ${ranked.length} visible, ${ops.length} updated.`);
  }
  return { total: ranked.length, visible: visible.length };
}
