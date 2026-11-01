"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProduct } from "@/app/(admin)/admin/actions";

type Props = { id: string; title: string; redirectTo?: string };

export default function DeleteProductButton({ id, title, redirectTo }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This also removes its reviews and can't be undone.`)) return;
    startTransition(async () => {
      try {
        const res = await deleteProduct(id);
        if (!res.ok) window.alert(res.error ?? "Could not delete the product.");
        else if (redirectTo) router.push(redirectTo);
      } catch {
        window.alert("Could not delete the product.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-custom-sm font-medium text-red ease-out duration-200 hover:text-red-dark disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
