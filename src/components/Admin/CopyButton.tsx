"use client";
import { useState } from "react";

/** Small "Copy" button for values staff paste elsewhere (e.g. a UTR into the bank app search). */
export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context): the value is still selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-md border border-gray-3 px-2 py-0.5 text-custom-xs font-medium text-dark hover:bg-gray-2"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
