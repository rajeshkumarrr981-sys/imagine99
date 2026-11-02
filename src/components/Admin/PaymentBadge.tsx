const styles: Record<string, string> = {
  pending: "bg-gray-2 text-dark",
  submitted: "bg-yellow-light-2 text-yellow-dark-2",
  paid: "bg-green-light-6 text-green-dark",
  failed: "bg-red-light-6 text-red",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = { cod: "COD", upi: "UPI" };

/** Human label for a payment status. Orders saved before payments existed have no method: treat as COD. */
export function paymentStatusLabel(method: string | null | undefined, status: string | null | undefined) {
  switch (status) {
    case "submitted":
      return "To verify";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    default:
      return (method ?? "cod") === "cod" ? "Due on delivery" : "Not paid";
  }
}

export default function PaymentBadge({ method, status }: { method?: string | null; status?: string | null }) {
  const s = status ?? "pending";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-custom-xs font-medium ${
        styles[s] ?? "bg-gray-2 text-dark"
      }`}
    >
      {paymentStatusLabel(method, s)}
    </span>
  );
}
