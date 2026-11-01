"use client";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";

type Props = {
  orderId: string;
  status: string;
  statuses: readonly string[];
  label?: string;
};

export default function OrderStatusSelect({ orderId, status, statuses, label = "Order status" }: Props) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    const previous = value;
    setValue(next);
    setError("");
    startTransition(async () => {
      try {
        const res = await updateOrderStatus(orderId, next);
        if (!res.ok) {
          setValue(previous);
          setError(res.error ?? "Update failed");
        }
      } catch {
        setValue(previous);
        setError("Update failed");
      }
    });
  }

  return (
    <div className="inline-flex flex-col">
      <select
        aria-label={label}
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-3 bg-gray-1 py-1.5 pl-3 pr-8 text-custom-sm capitalize outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-60"
      >
        {statuses.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>
      {pending && <span className="mt-1 text-custom-xs text-dark-4">Saving...</span>}
      {error && (
        <span role="alert" className="mt-1 text-custom-xs text-red">
          {error}
        </span>
      )}
    </div>
  );
}
