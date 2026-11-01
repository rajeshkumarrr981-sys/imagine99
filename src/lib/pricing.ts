// Shared by the checkout page (display) and the orders API (source of truth).
// Prices are stored in Indian Rupees.
export const SHIPPING_FLAT = 99;
export const FREE_SHIPPING_OVER = 4999;

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a rupee amount, e.g. 124900 -> "₹1,24,900". */
export const money = (n: number) => inr.format(n);
