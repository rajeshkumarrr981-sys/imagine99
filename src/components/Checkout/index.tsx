"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { COD_MIN_ORDER, money, orderTotals, TAX_LABEL } from "@/lib/pricing";

export type SavedAddress = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
};

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const Field = ({
  id,
  label,
  required,
  ...rest
}: { id: string; label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="w-full">
    <label htmlFor={id} className="block mb-2.5">
      {label} {required && <span className="text-red">*</span>}
    </label>
    <input id={id} name={id} required={required} className={inputClass} {...rest} />
  </div>
);

const Checkout = ({ defaults }: { defaults: SavedAddress }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const items = useAppSelector((s) => s.cartReducer.items);
  const totals = orderTotals(items.map((i) => ({ price: i.discountedPrice, quantity: i.quantity })));
  const [payment, setPayment] = useState<"upi" | "cod">("upi");
  const method = totals.codAllowed ? payment : "upi";
  const [showWhy, setShowWhy] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");

    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        shippingAddress: {
          name: get("name"),
          email: get("email"),
          phone: get("phone"),
          address: get("address"),
          city: get("city"),
          country: get("country"),
          zip: get("zip"),
        },
        notes: get("notes"),
        saveAddress: f.get("saveAddress") === "on",
        paymentMethod: method,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPlacing(false);
      setError(data.error ?? "Could not place your order. Please try again.");
      return;
    }
    dispatch(removeAllItemsFromCart());
    router.push(`/orders/${data.id}?placed=1`);
  }

  if (items.length === 0 && !placing) {
    return (
      <>
        <Breadcrumb title={"Checkout"} pages={["Cart", "Checkout"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[570px] mx-auto text-center bg-white shadow-1 rounded-xl p-10">
            <h2 className="font-medium text-xl text-dark mb-4">Your cart is empty</h2>
            <Link href="/shop-with-sidebar" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark">
              Continue Shopping
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["Cart", "Checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={placeOrder}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* left: shipping details */}
              <div className="lg:max-w-[670px] w-full">
                <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Shipping Details</h2>
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 flex flex-col gap-5">
                  <Field id="name" label="Full name" required defaultValue={defaults.name} autoComplete="name" />
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Field id="email" label="Email" type="email" required defaultValue={defaults.email} autoComplete="email" />
                    <Field id="phone" label="Phone" type="tel" defaultValue={defaults.phone} autoComplete="tel" />
                  </div>
                  <Field
                    id="address"
                    label="Street address"
                    required
                    defaultValue={defaults.address}
                    placeholder="House number and street name"
                    autoComplete="street-address"
                  />
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Field id="city" label="Town / City" required defaultValue={defaults.city} autoComplete="address-level2" />
                    <Field id="zip" label="Postcode / ZIP" defaultValue={defaults.zip} autoComplete="postal-code" />
                  </div>
                  <Field id="country" label="Country" required defaultValue={defaults.country} autoComplete="country-name" />

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" name="saveAddress" defaultChecked={!defaults.address} className="w-4 h-4" />
                    Save this address to my account
                  </label>
                </div>

                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5">
                    Other Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    maxLength={1000}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>
              </div>

              {/* right: order summary */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 py-5 border-b border-gray-3">
                        <p className="text-dark">
                          {item.title} <span className="text-dark-4">× {item.quantity}</span>
                        </p>
                        <p className="text-dark text-right whitespace-nowrap">{money(item.discountedPrice * item.quantity)}</p>
                      </div>
                    ))}

                    {totals.taxes > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <p className="text-dark">{TAX_LABEL}</p>
                        <p className="text-dark text-right">{money(totals.taxes)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Shipping</p>
                      <p className="text-dark text-right">Free</p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">{money(totals.total)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Payment Method</h3>
                  </div>
                  <div className="p-4 sm:p-8.5 flex flex-col gap-3">
                    <label className={`flex items-start gap-3 rounded-md border py-3.5 px-5 cursor-pointer ${method === "upi" ? "border-blue bg-blue-light-5" : "border-gray-3"}`}>
                      <input type="radio" name="payment" checked={method === "upi"} onChange={() => setPayment("upi")} className="mt-1 w-4 h-4" />
                      <span>
                        <span className="block text-dark font-medium">UPI (GPay, PhonePe, Paytm, any UPI app)</span>
                        <span className="block text-custom-sm">After placing the order you&apos;ll see a QR code to pay {money(totals.total)}.</span>
                      </span>
                    </label>

                    <label
                      className={`flex items-start gap-3 rounded-md border py-3.5 px-5 ${
                        !totals.codAllowed ? "opacity-60 cursor-not-allowed border-gray-3" : method === "cod" ? "border-blue bg-blue-light-5 cursor-pointer" : "border-gray-3 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        disabled={!totals.codAllowed}
                        checked={method === "cod"}
                        onChange={() => setPayment("cod")}
                        className="mt-1 w-4 h-4"
                      />
                      <span>
                        <span className="block text-dark font-medium">Cash on delivery</span>
                        <span className="block text-custom-sm">
                          {totals.codAllowed
                            ? "Pay in cash when your order arrives."
                            : `Available on orders of ${money(COD_MIN_ORDER)} or more. Add ${money(COD_MIN_ORDER - totals.total)} more to unlock.`}
                        </span>
                      </span>
                    </label>

                    <button type="button" onClick={() => setShowWhy((v) => !v)} className="self-start text-custom-sm text-blue underline underline-offset-2">
                      Why not COD on every order?
                    </button>
                    {showWhy && (
                      <p className="text-custom-sm rounded-md bg-gray-1 p-4 leading-relaxed">
                        We operate on a high-volume basis and need a minimum number of orders from an area to deliver these products at
                        these prices. Cash on delivery leads to more returns and cancellations, which would hold us back and stop us from
                        offering this value. We hope you understand. COD is available on orders of {money(COD_MIN_ORDER)} and above.
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <p role="alert" className="mt-7.5 rounded-lg bg-red-light-6 text-red px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60"
                >
                  {placing ? "Placing order..." : method === "upi" ? `Place order & pay ${money(totals.total)}` : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
