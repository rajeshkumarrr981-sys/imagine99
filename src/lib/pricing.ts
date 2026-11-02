// Store pricing rules. Shared by the browser (display) and the orders API (source of truth).
// Prices are in Indian Rupees.

/** Every product sells at one of these prices. */
export const PRICE_TIERS = [149, 249, 399] as const;

/** Which tier a product falls into, by its original selling price. */
const TIER_BANDS = [
  { below: 800, tier: 149 },
  { below: 1300, tier: 249 },
  { below: Infinity, tier: 399 },
];

export function tierFor(originalPrice: number): number {
  return TIER_BANDS.find((b) => originalPrice < b.below)!.tier;
}

/** Flat amount added per unit for items priced under ₹399 (the ₹149 and ₹249 tiers). */
export const TAX_PER_ITEM = 49;
export const TAX_FREE_FROM = 399;
export const TAX_LABEL = "Taxes";

export const taxFor = (unitPrice: number) => (unitPrice < TAX_FREE_FROM ? TAX_PER_ITEM : 0);

/** Cash on delivery is only offered for orders of at least this total. */
export const COD_MIN_ORDER = 2499;

// Shipping is included in the price.
export const SHIPPING_FLAT = 0;
export const FREE_SHIPPING_OVER = 0;
export const shippingFor = (_subtotal: number) => 0;

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Totals for a cart or order. */
export function orderTotals(lines: { price: number; quantity: number }[]) {
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const taxes = round2(lines.reduce((s, l) => s + taxFor(l.price) * l.quantity, 0));
  const shipping = shippingFor(subtotal);
  const total = round2(subtotal + taxes + shipping);
  return { subtotal, taxes, shipping, total, codAllowed: total >= COD_MIN_ORDER };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a rupee amount, e.g. 124900 -> "₹1,24,900". */
export const money = (n: number) => inr.format(n);
