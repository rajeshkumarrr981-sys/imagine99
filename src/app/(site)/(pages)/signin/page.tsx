import Signin from "@/components/Auth/Signin";
import { currentUser, isGoogleEnabled } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in | Imagine99",
};

// Only allow redirects back into this site.
function safeCallback(url?: string) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/my-account";
}

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const target = safeCallback(callbackUrl);
  if (await currentUser()) redirect(target);

  return (
    <main>
      <Signin googleEnabled={isGoogleEnabled} callbackUrl={target} error={error} />
    </main>
  );
}
