"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { removeAllItemsFromCart, selectTotalPrice } from "@/redux/features/cart-slice";
import { FREE_SHIPPING_OVER, money, round2, shippingFor } from "@/lib/pricing";

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
  const subtotal = round2(useSelector(selectTotalPrice));
  const shipping = shippingFor(subtotal);
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

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Shipping</p>
                      <p className="text-dark text-right">{shipping ? money(shipping) : "Free"}</p>
                    </div>
                    {shipping > 0 && (
                      <p className="text-custom-sm pt-3">Free shipping on orders over {money(FREE_SHIPPING_OVER)}.</p>
                    )}

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">{money(subtotal + shipping)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Payment Method</h3>
                  </div>
                  <div className="p-4 sm:p-8.5">
                    <label className="flex items-center gap-3 rounded-md border border-blue bg-blue-light-5 py-3.5 px-5">
                      <input type="radio" checked readOnly className="w-4 h-4" />
                      <span className="text-dark">Cash on delivery</span>
                    </label>
                    <p className="text-custom-sm mt-3">Online payments are coming soon.</p>
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
                  {placing ? "Placing order..." : "Place Order"}
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
