import Signup from "@/components/Auth/Signup";
import { currentUser, isGoogleEnabled } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create account | Imagine99",
};

export default async function SignupPage() {
  if (await currentUser()) redirect("/my-account");

  return (
    <main>
      <Signup googleEnabled={isGoogleEnabled} />
    </main>
  );
}
