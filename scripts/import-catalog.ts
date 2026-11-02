// Imports supplier catalogues (Shopify "products.json"-style exports) into MongoDB.
//
//   npm run import -- <file.json> [<file.json> ...] [--dry-run] [--include-sold-out] [--remove-samples]
//
// --dry-run           show what would be imported, write nothing
// --include-sold-out  also import products marked unavailable (stock 0)
// --remove-samples    delete products that did not come from a catalogue (the demo items)
//
// Re-running is safe: products are matched on "<site>:<product id>" and updated in place.
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { ProductModel } from "../src/models/Product";

type Variant = { price: string; compare_at_price: string | null; available: boolean };
type Item = {
  id: number;
  site?: string;
  url?: string;
  title: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  published_at?: string;
  body_html?: string;
  available?: boolean;
  variants: Variant[];
  images?: { src: string; position?: number }[];
};

const DEFAULT_STOCK = 25; // the exports say in stock or not, without quantities
const MAX_IMAGES = 6;

// Store categories, matched against the supplier's product type (then the title). First match wins.
const RULES: [RegExp, string][] = [
  [/idol|devotion|urli|diya|incense|spiritual|chowki|shankh|shivling|decorative bell|pooja|puja/i, "Pooja Essentials"],
  [/kids gift|pretend play|party game|\btoy/i, "Kids & Play"],
  [/hamper|envelope|rakhi|add-on/i, "Festive Gifting"],
  [/lunch|bento|snack container|dip container|school bag|sipper|water bottle|wide-mouth bottle|^combo$|^cutlery$|section plate/i, "Lunch Boxes & Bottles"],
  [/lamp|chandelier|candle|tea light|lantern|diffuser/i, "Lighting & Candles"],
  [/planter/i, "Planters"],
  [/cushion|throw|blanket|\brug\b|floor mat/i, "Cushions & Textiles"],
  [/bath|tissue|towel|organiser|organizer|basket|hanger|travel kit|beauty/i, "Bath & Organisers"],
  [/earring|jewel|notebook|tote|pen stand/i, "Accessories"],
  [/wall plate|decorative|trinket|^wall|wall d[eé]cor/i, "Home Décor"],
  [/mug|tea cup|cup & saucer|tumbler|glass|kullad|jug|drink dispenser|kettle|tea set|bar tool|stirrer/i, "Drinkware & Bar"],
  [/jar|container|spice|oil bottle|chapati|tea box|kitchen tool|measuring|chalkboard|utility box|^box$/i, "Kitchen & Storage"],
  [/platter|plate|bowl|katori|serving|cake|dinner|pickle|salt & pepper|cheese|casserole|tray|cutlery|spoon|knife|napkin|table mat|table runner|coaster|trivet|chutney|\bdip\b/i, "Dining & Serveware"],
  [/curio|vase|d[eé]cor|showpiece|book end|wind chime|bird house|door knocker|\bkey|magnet|clock|dried flower|magazine|chair|side table|garden|hanging/i, "Home Décor"],
];

function categoryFor(item: Item): { category: string; matched: boolean } {
  for (const text of [item.product_type ?? "", item.title]) {
    if (!text.trim()) continue;
    const rule = RULES.find(([re]) => re.test(text));
    if (rule) return { category: rule[1], matched: true };
  }
  return { category: "Home Décor", matched: false };
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

function decodeEntities(s: string) {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", deg: "°", times: "×" };
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s/(&-])([a-z])/g, (_, p, c) => p + c.toUpperCase());

// Supplier names and contact details are removed: the store doesn't show source brands.
const DROP_LINE = /exclusive\s?lane|etail marketing|care@|nestip|sahibabad|\bsku\b/i;

function cleanDescription(html: string, brand: string): string {
  let t = html
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\s*br\s*\/?>|<\/\s*(p|h\d|li|div|tr|ul|ol)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  t = decodeEntities(t);

  const raw = t.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const lines: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    let line = raw[i];
    // "MATERIAL:" on one line and the value on the next -> "Material: Sheesham Wood"
    if (/^[A-Z][A-Z &/()'-]{1,40}:$/.test(line) && i + 1 < raw.length && !/:$/.test(raw[i + 1])) {
      line = `${titleCase(line.slice(0, -1))}: ${raw[++i]}`;
    } else if (line === "-" && i + 1 < raw.length) {
      line = `- ${raw[++i]}`;
    } else if (/^[A-Z][A-Z &/'-]{2,30}$/.test(line)) {
      line = titleCase(line); // section headings like SPECIFICATIONS
    }
    if (DROP_LINE.test(line)) continue;
    // "Manufactured, Imported & Marketed by: <supplier company>" and similar
    if (/(marketed|manufactured|imported|packed)[\w\s,&]{0,40}\bby\b/i.test(line) || /dzignx/i.test(line)) continue;
    lines.push(line);
  }

  let out = lines.join("\n");
  if (brand === "Basil") out = out.replace(/\bBasil('s)?\s+/g, "");
  out = out.replace(/\bNestasia('s)?\s*/gi, "");
  return out.slice(0, 4000).trim();
}

function cleanTitle(title: string, brand: string) {
  let t = title.replace(/\s+/g, " ").trim();
  if (brand === "Basil") t = t.replace(/\bBasil\s+/g, "");
  return t
    .replace(/\bNestasia\s+/gi, "")
    .replace(/\bExclusive\s?Lane('s)?\s*/gi, "")
    .replace(/\s+-\s*$/, "")
    .trim();
}

function toProduct(item: Item, includeSoldOut: boolean) {
  const brand = item.vendor ?? "";
  const tags = item.tags ?? [];
  if (tags.some((t) => /unlisted|hidden/i.test(t))) return { skip: "unlisted" as const };
  if (!item.available && !includeSoldOut) return { skip: "sold out" as const };

  const variants = item.variants.filter((v) => v.available) ?? [];
  const pool = variants.length ? variants : item.variants;
  const v = pool.reduce((best, cur) => (num(cur.price) < num(best.price) ? cur : best), pool[0]);
  const sale = num(v?.price);
  if (!(sale > 0)) return { skip: "no price" as const };
  const compare = num(v.compare_at_price);

  const images = [...(item.images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.src)
    .filter((src) => /^https:\/\//.test(src))
    .slice(0, MAX_IMAGES);
  if (images.length === 0) return { skip: "no images" as const };

  const site = new URL(item.site ?? item.url ?? "https://unknown").hostname.replace(/^www\./, "");
  const { category, matched } = categoryFor(item);

  return {
    matched,
    doc: {
      title: cleanTitle(item.title, brand),
      description: cleanDescription(item.body_html ?? "", brand),
      category,
      price: compare > sale ? compare : sale,
      discountedPrice: sale,
      stock: item.available ? DEFAULT_STOCK : 0,
      images: { thumbnails: images, previews: images },
      bestseller: tags.some((t) => /best\s?seller/i.test(t)),
      festive: category === "Pooja Essentials" || category === "Festive Gifting" || tags.some((t) => /diwali|festive/i.test(t)),
      publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
      source: {
        key: `${site}:${item.id}`,
        brand,
        sku: (v as Variant & { sku?: string }).sku ?? "",
        url: item.url ?? "",
        type: item.product_type ?? "",
      },
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const files = args.filter((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  const includeSoldOut = args.includes("--include-sold-out");
  const removeSamples = args.includes("--remove-samples");
  if (files.length === 0) throw new Error("Pass at least one catalogue JSON file.");

  const docs = new Map<string, ReturnType<typeof toProduct> extends infer R ? (R extends { doc: infer D } ? D : never) : never>();
  const skipped: Record<string, number> = {};
  const unmatched = new Map<string, number>();

  for (const file of files) {
    const data = JSON.parse(readFileSync(file, "utf8"));
    const items: Item[] = Array.isArray(data) ? data : data.items;
    for (const item of items) {
      const r = toProduct({ ...item, site: item.site ?? data.site }, includeSoldOut);
      if ("skip" in r) {
        skipped[r.skip!] = (skipped[r.skip!] ?? 0) + 1;
        continue;
      }
      if (!r.matched) unmatched.set(item.product_type || "(none)", (unmatched.get(item.product_type || "(none)") ?? 0) + 1);
      if (docs.has(r.doc.source.key)) skipped.duplicate = (skipped.duplicate ?? 0) + 1;
      docs.set(r.doc.source.key, r.doc);
    }
  }

  const all = [...docs.values()];
  const byCat = new Map<string, number>();
  for (const d of all) byCat.set(d.category, (byCat.get(d.category) ?? 0) + 1);
  console.log(`Products ready: ${all.length}`);
  console.log("Skipped:", skipped);
  console.log("By category:", Object.fromEntries([...byCat].sort((a, b) => b[1] - a[1])));
  console.log(`Best sellers: ${all.filter((d) => d.bestseller).length}, festive: ${all.filter((d) => d.festive).length}`);
  if (unmatched.size) console.log("Fell back to Home Décor:", Object.fromEntries(unmatched));

  const leaks = all.filter((d) => /exclusive\s?lane|nestasia|\bbasil\b|etail marketing|dzignx/i.test(`${d.title}\n${d.description}`));
  console.log(`Supplier names left in text: ${leaks.length}`);
  for (const d of leaks.slice(0, 5)) {
    const m = `${d.title}\n${d.description}`.match(/.{0,60}(exclusive\s?lane|nestasia|\bbasil\b|etail marketing|dzignx).{0,60}/i);
    console.log("  -", d.source.brand, "|", m?.[0]);
  }

  if (dryRun) {
    for (const d of [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]]) {
      console.log("\n---", d.title, "|", d.category, "|", d.discountedPrice, "/", d.price);
      console.log(d.description.slice(0, 500));
    }
    console.log("\nDry run: nothing written.");
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  await ProductModel.syncIndexes();

  if (removeSamples) {
    const res = await ProductModel.deleteMany({ "source.key": { $exists: false } });
    console.log(`Removed ${res.deletedCount} demo products.`);
  }

  let written = 0;
  for (let i = 0; i < all.length; i += 500) {
    const batch = all.slice(i, i + 500);
    const res = await ProductModel.bulkWrite(
      batch.map((d) => ({
        updateOne: {
          filter: { "source.key": d.source.key },
          update: { $set: d, $setOnInsert: { reviewCount: 0, rating: 0 } },
          upsert: true,
        },
      }))
    );
    written += res.upsertedCount + res.modifiedCount;
    console.log(`Batch ${i / 500 + 1}: ${res.upsertedCount} new, ${res.modifiedCount} updated`);
  }
  console.log(`Done. ${written} products written. Total in database: ${await ProductModel.countDocuments()}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
