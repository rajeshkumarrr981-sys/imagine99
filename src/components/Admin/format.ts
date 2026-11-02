// Shared formatting helpers for the admin panel (safe on server and client).

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatMoney(value: number | null | undefined) {
  return inr.format(Number(value ?? 0));
}

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export const adminInputClass =
  "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 font-medium text-dark bg-white border border-gray-3 py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-gray-2 disabled:opacity-60";

/** Total quantity across order line items. */
export function countItems(items: ReadonlyArray<{ quantity?: number | null }> | null | undefined) {
  let n = 0;
  for (const item of items ?? []) n += item.quantity ?? 0;
  return n;
}

/**
 * Smaller admin thumbnails: for Shopify CDN images, ask for a `width` instead of
 * downloading the full-size original. Other URLs are returned unchanged.
 */
export function thumb(url: string | null | undefined, width = 160): string {
  if (!url) return "";
  if (!url.startsWith("https://cdn.shopify.com/")) return url;
  try {
    const u = new URL(url);
    if (u.hostname !== "cdn.shopify.com") return url;
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}

/** Supplier details stored on a product (admin only, never shown on the storefront). */
export type SupplierSource = {
  brand: string;
  sku: string;
  type: string;
  /** Only set when it's a valid http(s) URL, so it's safe to use as a link href. */
  url: string;
  /** Supplier's MRP and own selling price, when known. */
  mrp: number | null;
  salePrice: number | null;
};

/**
 * Reads `product.source` defensively (it comes straight from the DB) and returns
 * null when there's no supplier brand.
 */
export function readSupplierSource(value: unknown): SupplierSource | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const str = (x: unknown) => (typeof x === "string" ? x.trim() : "");
  const brand = str(v.brand);
  if (!brand) return null;
  let url = "";
  try {
    const u = new URL(str(v.url));
    if (u.protocol === "https:" || u.protocol === "http:") url = u.toString();
  } catch {
    // missing or invalid URL: no link
  }
  const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : null);
  return { brand, sku: str(v.sku), type: str(v.type), url, mrp: num(v.mrp), salePrice: num(v.salePrice) };
}
