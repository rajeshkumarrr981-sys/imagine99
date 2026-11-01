import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Checkout from "@/components/Checkout";
import { currentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const metadata: Metadata = {
  title: "Checkout | Imagine99",
};

export default async function CheckoutPage() {
  const me = await currentUser();
  if (!me) redirect("/signin?callbackUrl=/checkout");

  await connectDB();
  const user = await User.findById(me.id).select("name email address").lean();
  const a = user?.address;

  return (
    <main>
      <Checkout
        defaults={{
          name: a?.name || user?.name || "",
          email: a?.email || user?.email || "",
          phone: a?.phone ?? "",
          address: a?.address ?? "",
          city: a?.city ?? "",
          country: a?.country ?? "",
          zip: a?.zip ?? "",
        }}
      />
    </main>
  );
}
