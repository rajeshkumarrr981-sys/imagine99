"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/pricing";

type Props = {
  orderId: string;
  amount: number;
  upiId: string;
  payeeName: string;
  upiLink: string;
  qrSvg: string;
  failed?: boolean;
};

/** Pay-by-UPI panel: QR code, UPI app link and the form for the transaction ID. */
export default function UpiPayment({ orderId, amount, upiId, payeeName, upiLink, qrSvg, failed }: Props) {
  const router = useRouter();
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utr }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5 border-2 border-marigold/60">
      <p className="eyebrow">Step 2 of 2</p>
      <h2 className="mt-2 text-[26px] leading-tight text-dark">Pay {money(amount)} by UPI</h2>
      {failed && (
        <p role="alert" className="mt-3 rounded-md bg-red-light-6 text-red px-4 py-3 text-custom-sm">
          We couldn&apos;t confirm your last payment. Please check the transaction ID or pay again.
        </p>
      )}

      <div className="mt-6 grid sm:grid-cols-[200px_1fr] gap-7 items-start">
        <div className="mx-auto sm:mx-0 w-[200px] rounded-lg border border-gray-3 bg-white p-3" aria-label="UPI QR code">
          <div className="[&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>

        <div className="flex flex-col gap-4">
          <ol className="list-decimal pl-5 text-custom-sm leading-relaxed text-dark-3 space-y-1">
            <li>Scan the QR code with any UPI app, or tap the button below on your phone.</li>
            <li>
              Pay exactly <strong className="text-dark">{money(amount)}</strong> to <strong className="text-dark">{payeeName}</strong>.
            </li>
            <li>Enter the UPI transaction ID (UTR) from your app below.</li>
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <a href={upiLink} className="inline-flex rounded-full bg-blue px-6 py-3 font-medium text-white hover:bg-blue-dark ease-out duration-200">
              Pay with UPI app
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(upiId).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-4 px-5 py-3 text-custom-sm text-dark hover:border-brass"
            >
              <span className="font-mono">{upiId}</span>
              <span className="text-blue">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <form onSubmit={submit} className="mt-2">
            <label htmlFor="utr" className="block mb-2 text-dark font-medium">
              UPI transaction ID (UTR)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\s/g, ""))}
                required
                inputMode="numeric"
                placeholder="e.g. 412345678901"
                className="flex-1 rounded-md border border-gray-3 bg-gray-1 py-3 px-5 font-mono outline-none focus:border-brass"
              />
              <button disabled={saving} className="rounded-md bg-dark px-6 py-3 font-medium text-ivory hover:bg-blue disabled:opacity-60">
                {saving ? "Saving…" : "I've paid"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-custom-sm text-red">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
