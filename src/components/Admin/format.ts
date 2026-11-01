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
