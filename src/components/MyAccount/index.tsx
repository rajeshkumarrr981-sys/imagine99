"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import { money } from "@/lib/pricing";

export type AccountOrder = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  itemCount: number;
};

export type AccountAddress = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};

type Props = {
  user: { name: string; email: string; image?: string; role: string; memberSince: string; hasPassword: boolean };
  orders: AccountOrder[];
  address: AccountAddress;
};

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Address" },
  { id: "account-details", label: "Account Details" },
];

const statusColor: Record<string, string> = {
  pending: "text-[#F27430] bg-[#FEF4ED]",
  processing: "text-blue bg-blue-light-5",
  shipped: "text-blue bg-blue-light-5",
  delivered: "text-green bg-green-light-6",
  cancelled: "text-red bg-red-light-6",
};

async function patchAccount(body: object) {
  const res = await fetch("/api/account", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
}

const MyAccount = ({ user, orders, address }: Props) => {
  const router = useRouter();
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>, success: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const saveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "");
    run(async () => {
      await patchAccount({ action: "profile", name });
      await update(); // refresh the name shown in the header
    }, "Profile updated");
  };

  const savePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("newPassword") !== f.get("confirmPassword")) {
      toast.error("New passwords do not match");
      return;
    }
    run(async () => {
      await patchAccount({
        action: "password",
        currentPassword: String(f.get("currentPassword") ?? ""),
        newPassword: String(f.get("newPassword") ?? ""),
      });
      form.reset();
    }, "Password changed");
  };

  const saveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    run(
      () =>
        patchAccount({
          action: "address",
          address: {
            name: get("name"),
            email: get("email"),
            phone: get("phone"),
            address: get("address"),
            city: get("city"),
            country: get("country"),
            zip: get("zip"),
          },
        }),
      "Address saved"
    );
  };

  return (
    <>
      <Breadcrumb title={"My account"} pages={["Account"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* menu */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1 self-start">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-blue text-white flex items-center justify-center text-2xl font-medium">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" width={64} height={64} referrerPolicy="no-referrer" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-dark mb-0.5">{user.name}</p>
                    <p className="text-custom-xs">Member since {user.memberSince}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9 w-full">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                          activeTab === t.id ? "text-white bg-blue" : "text-dark-2 bg-gray-1"
                        }`}
                      >
                        {t.label}
                        {t.id === "orders" && ` (${orders.length})`}
                      </button>
                    ))}
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 text-dark-2 bg-gray-1 hover:bg-blue hover:text-white"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 text-dark-2 bg-gray-1 hover:bg-blue hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* content */}
            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
              {activeTab === "dashboard" && (
                <div>
                  <p className="text-dark">Hello {user.name},</p>
                  <p className="text-custom-sm mt-4">
                    From your account dashboard you can view your{" "}
                    <button className="text-blue" onClick={() => setActiveTab("orders")}>
                      recent orders
                    </button>
                    , manage your{" "}
                    <button className="text-blue" onClick={() => setActiveTab("addresses")}>
                      shipping address
                    </button>
                    , and{" "}
                    <button className="text-blue" onClick={() => setActiveTab("account-details")}>
                      edit your password and account details
                    </button>
                    .
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7.5">
                    <div className="rounded-lg bg-gray-1 p-5">
                      <p className="text-custom-sm">Orders</p>
                      <p className="font-medium text-2xl text-dark">{orders.length}</p>
                    </div>
                    <div className="rounded-lg bg-gray-1 p-5">
                      <p className="text-custom-sm">Total spent</p>
                      <p className="font-medium text-2xl text-dark">
                        {money(orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="overflow-x-auto">
                  {orders.length === 0 ? (
                    <p>
                      You haven&apos;t placed any orders yet.{" "}
                      <Link href="/shop-with-sidebar" className="text-blue">
                        Start shopping
                      </Link>
                    </p>
                  ) : (
                    <table className="w-full min-w-[560px] text-left">
                      <thead>
                        <tr className="border-b border-gray-3 text-dark">
                          <th className="py-3 font-medium">Order</th>
                          <th className="py-3 font-medium">Date</th>
                          <th className="py-3 font-medium">Status</th>
                          <th className="py-3 font-medium">Total</th>
                          <th className="py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id} className="border-b border-gray-3">
                            <td className="py-4 text-dark">#{o.id.slice(-8).toUpperCase()}</td>
                            <td className="py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="py-4">
                              <span className={`inline-block capitalize text-custom-sm py-0.5 px-2.5 rounded-[30px] ${statusColor[o.status] ?? ""}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-4">
                              {money(o.total)} <span className="text-custom-sm">({o.itemCount} items)</span>
                            </td>
                            <td className="py-4 text-right">
                              <Link href={`/orders/${o.id}`} className="text-blue">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <form onSubmit={saveAddress} className="flex flex-col gap-5">
                  <h2 className="font-medium text-xl text-dark">Shipping Address</h2>
                  <p className="text-custom-sm -mt-3">Used to pre-fill checkout.</p>
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Input name="name" label="Full name" defaultValue={address.name} />
                    <Input name="email" label="Email" type="email" defaultValue={address.email} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Input name="phone" label="Phone" defaultValue={address.phone} />
                    <Input name="country" label="Country" defaultValue={address.country} />
                  </div>
                  <Input name="address" label="Street address" defaultValue={address.address} />
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Input name="city" label="Town / City" defaultValue={address.city} />
                    <Input name="zip" label="Postcode / ZIP" defaultValue={address.zip} />
                  </div>
                  <SaveButton busy={busy}>Save Address</SaveButton>
                </form>
              )}

              {activeTab === "account-details" && (
                <div className="flex flex-col gap-10">
                  <form onSubmit={saveProfile} className="flex flex-col gap-5">
                    <h2 className="font-medium text-xl text-dark">Account Details</h2>
                    <Input name="name" label="Full name" defaultValue={user.name} required minLength={2} />
                    <div className="w-full">
                      <label className="block mb-2.5">Email</label>
                      <input value={user.email} disabled className={`${inputClass} opacity-70`} />
                    </div>
                    <SaveButton busy={busy}>Save Changes</SaveButton>
                  </form>

                  <form onSubmit={savePassword} className="flex flex-col gap-5">
                    <h2 className="font-medium text-xl text-dark">{user.hasPassword ? "Change Password" : "Set a Password"}</h2>
                    {user.hasPassword && (
                      <Input name="currentPassword" label="Current password" type="password" required autoComplete="current-password" />
                    )}
                    <Input name="newPassword" label="New password" type="password" required minLength={8} autoComplete="new-password" />
                    <Input name="confirmPassword" label="Confirm new password" type="password" required autoComplete="new-password" />
                    <SaveButton busy={busy}>{user.hasPassword ? "Change Password" : "Set Password"}</SaveButton>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const Input = ({ name, label, ...rest }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="w-full">
    <label htmlFor={name} className="block mb-2.5">
      {label}
    </label>
    <input id={name} name={name} className={inputClass} {...rest} />
  </div>
);

const SaveButton = ({ busy, children }: { busy: boolean; children: React.ReactNode }) => (
  <button
    type="submit"
    disabled={busy}
    className="self-start inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
  >
    {children}
  </button>
);

export default MyAccount;
