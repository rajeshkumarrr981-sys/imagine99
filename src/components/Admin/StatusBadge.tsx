const styles: Record<string, string> = {
  pending: "bg-yellow-light-2 text-yellow-dark-2",
  processing: "bg-blue-light-5 text-blue",
  shipped: "bg-blue-light-5 text-blue-dark",
  delivered: "bg-green-light-6 text-green-dark",
  cancelled: "bg-red-light-6 text-red",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-custom-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-2 text-dark"
      }`}
    >
      {status}
    </span>
  );
}
