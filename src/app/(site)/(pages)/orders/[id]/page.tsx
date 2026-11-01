import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { currentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { money } from "@/lib/pricing";

export const metadata: Metadata = { title: "Order | Imagine99" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const me = await currentUser();
  if (!me) redirect(`/signin?callbackUrl=/orders/${id}`);
  if (!isValidObjectId(id)) notFound();

  await connectDB();
  const order = await Order.findById(id).lean();
  // Only the customer who placed it (or an admin) can see an order.
  if (!order || (String(order.user) !== me.id && me.role !== "admin")) notFound();

  const a = order.shippingAddress;
  const shortId = String(order._id).slice(-8).toUpperCase();

  return (
    <main>
      <Breadcrumb title={`Order #${shortId}`} pages={["Account", "Orders"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[870px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {placed && (
            <div className="bg-green-light-6 text-green rounded-[10px] px-6 py-4 mb-7.5">
              Thank you! Your order has been placed. A confirmation email is on its way to {a.email}.
            </div>
          )}

          <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-3">
              <div>
                <h2 className="font-medium text-xl text-dark">Order #{shortId}</h2>
                <p className="text-custom-sm">Placed {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="inline-block capitalize rounded-[30px] bg-blue-light-5 text-blue text-custom-sm py-1 px-3.5">
                {order.status}
              </span>
            </div>

            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-5 py-5 border-b border-gray-3">
                <div className="flex items-center justify-center rounded-[5px] bg-gray-2 w-16 h-16 shrink-0">
                  {item.image && <Image src={item.image} alt="" width={48} height={48} />}
                </div>
                <div className="flex-1">
                  <Link href={`/shop-details/${item.product}`} className="text-dark hover:text-blue">
                    {item.title}
                  </Link>
                  <p className="text-custom-sm">
                    {money(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-dark">{money(item.price * item.quantity)}</p>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between gap-7.5 pt-6">
              <div>
                <h3 className="font-medium text-dark mb-2">Shipping to</h3>
                <p>
                  {a.name}
                  <br />
                  {a.address}
                  <br />
                  {a.city} {a.zip}
                  <br />
                  {a.country}
                  {a.phone && (
                    <>
                      <br />
                      {a.phone}
                    </>
                  )}
                </p>
                {order.notes && <p className="mt-3 text-custom-sm">Note: {order.notes}</p>}
              </div>
              <div className="min-w-[220px]">
                <p className="flex justify-between">
                  <span>Subtotal</span> <span className="text-dark">{money(order.subtotal)}</span>
                </p>
                <p className="flex justify-between mt-1">
                  <span>Shipping</span> <span className="text-dark">{order.shippingCost ? money(order.shippingCost) : "Free"}</span>
                </p>
                <p className="flex justify-between mt-3 font-medium text-lg text-dark">
                  <span>Total</span> <span>{money(order.total)}</span>
                </p>
                <p className="text-custom-sm mt-1">Payment: cash on delivery</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-7.5">
            <Link href="/my-account" className="inline-flex font-medium text-white bg-dark py-3 px-6 rounded-md hover:bg-blue">
              My Orders
            </Link>
            <Link href="/shop-with-sidebar" className="inline-flex font-medium text-dark bg-white shadow-1 py-3 px-6 rounded-md hover:text-blue">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
