"use client";
import { useState, useTransition } from "react";
import { updatePaymentStatus } from "@/app/(admin)/admin/actions";

type Props = { orderId: string };

/** "Mark as paid" / "Mark as failed" for UPI orders awaiting a bank check. */
export default function PaymentActions({ orderId }: Props) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function update(status: "paid" | "failed") {
    if (
      status === "failed" &&
      !confirm("Mark this payment as failed? Only do this if the UTR isn't in the bank app.")
    ) {
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const res = await updatePaymentStatus(orderId, status);
        if (!res.ok) setError(res.error ?? "Update failed");
      } catch {
        setError("Update failed");
      }
    });
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => update("paid")}
          className="inline-flex items-center justify-center font-medium text-white bg-green py-2 px-4 rounded-lg ease-out duration-200 hover:bg-green-dark disabled:opacity-60"
        >
          Mark as paid
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => update("failed")}
          className="inline-flex items-center justify-center font-medium text-red bg-white border border-gray-3 py-2 px-4 rounded-lg ease-out duration-200 hover:bg-red-light-6 disabled:opacity-60"
        >
          Mark as failed
        </button>
      </div>
      {pending && <p className="mt-2 text-custom-xs text-dark-4">Saving...</p>}
      {error && (
        <p role="alert" className="mt-2 text-custom-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}
