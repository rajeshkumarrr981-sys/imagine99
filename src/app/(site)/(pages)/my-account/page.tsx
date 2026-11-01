import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import MyAccount from "@/components/MyAccount";
import { currentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";

export const metadata: Metadata = {
  title: "My Account | Imagine99",
};

export default async function MyAccountPage() {
  const me = await currentUser();
  if (!me) redirect("/signin?callbackUrl=/my-account");

  await connectDB();
  const [user, orders] = await Promise.all([
    User.findById(me.id).select("+passwordHash").lean(),
    Order.find({ user: me.id }).sort({ createdAt: -1 }).lean(),
  ]);
  if (!user) redirect("/signin");

  const a = user.address;
  return (
    <main>
      <MyAccount
        user={{
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role,
          memberSince: new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          hasPassword: !!user.passwordHash,
        }}
        orders={orders.map((o) => ({
          id: String(o._id),
          createdAt: new Date(o.createdAt).toISOString(),
          status: o.status,
          total: o.total,
          itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
        }))}
        address={{
          name: a?.name ?? "",
          email: a?.email ?? "",
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
