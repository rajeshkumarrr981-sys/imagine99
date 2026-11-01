"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        signOut({ callbackUrl: "/" });
      }}
      className={className}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
