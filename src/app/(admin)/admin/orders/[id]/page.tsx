import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order, ORDER_STATUSES } from "@/models/Order";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import { countItems, formatDate, formatMoney } from "@/components/Admin/format";
import OrderStatusSelect from "@/components/Admin/OrderStatusSelect";
import StatusBadge from "@/components/Admin/StatusBadge";

export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ id: string }> };

const PAYMENT_LABELS: Record<string, string> = { cod: "Cash on delivery" };

export default async function AdminOrderPage({ params }: Props) {
  if (!(await requireAdmin())) return <Forbidden />;

  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDB();
  const order = await Order.findById(id)
    .populate<{ user: { _id: unknown; name?: string; email?: string } | null }>("user", "name email")
    .lean();
  if (!order) notFound();

  const ref = `#${String(order._id).slice(-6).toUpperCase()}`;
  const addr = order.shippingAddress;
  const items = order.items ?? [];

  return (
    <div className="max-w-[1170px] mx-auto">
      <Link href="/admin/orders" className="text-custom-sm text-blue hover:underline">
        ← Orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-7.5">
        <div>
          <h1 className="font-semibold text-heading-6 text-dark flex items-center gap-3">
            Order {ref} <StatusBadge status={order.status} />
          </h1>
          <p className="text-custom-sm text-dark-4 mt-1">
            Placed {formatDate(order.createdAt, true)}
            {order.updatedAt && String(order.updatedAt) !== String(order.createdAt)
              ? ` · Updated ${formatDate(order.updatedAt, true)}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-custom-sm font-medium text-dark">Status</span>
          <OrderStatusSelect orderId={String(order._id)} status={order.status} statuses={ORDER_STATUSES} />
        </div>
      </div>

      <div className="grid gap-7.5 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-xl bg-white shadow-1">
          <h2 className="font-semibold text-custom-lg text-dark px-6 py-4 border-b border-gray-3">
            Items ({countItems(items)})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-custom-sm">
              <thead className="text-dark-4">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium text-right">Unit price</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${String(item.product)}-${idx}`} className="border-t border-gray-3">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-2 overflow-hidden flex items-center justify-center">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="w-full h-full object-contain" loading="lazy" />
                          )}
                        </div>
                        <Link href={`/admin/products/${String(item.product)}/edit`} className="text-dark hover:text-blue">
                          {item.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">{formatMoney(item.price)}</td>
                    <td className="px-6 py-3 text-right">{item.quantity}</td>
                    <td className="px-6 py-3 text-right whitespace-nowrap text-dark">
                      {formatMoney(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="border-t border-gray-3 px-6 py-4 grid gap-2 text-custom-sm ml-auto max-w-[320px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-dark">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="text-dark">{order.shippingCost ? formatMoney(order.shippingCost) : "Free"}</dd>
            </div>
            <div className="flex justify-between font-semibold text-dark text-custom-lg pt-2 border-t border-gray-3">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="grid gap-7.5 content-start">
          <section className="rounded-xl bg-white shadow-1 p-6">
            <h2 className="font-semibold text-custom-lg text-dark mb-3">Shipping address</h2>
            {addr ? (
              <address className="not-italic text-custom-sm leading-relaxed">
                <span className="block text-dark font-medium">{addr.name}</span>
                <span className="block">{addr.address}</span>
                <span className="block">
                  {[addr.city, addr.zip].filter(Boolean).join(" ")}
                </span>
                <span className="block">{addr.country}</span>
                {addr.email && (
                  <a href={`mailto:${addr.email}`} className="block mt-2 text-blue hover:underline">
                    {addr.email}
                  </a>
                )}
                {addr.phone && <span className="block">{addr.phone}</span>}
              </address>
            ) : (
              <p className="text-custom-sm">No address on file.</p>
            )}
          </section>

          <section className="rounded-xl bg-white shadow-1 p-6 text-custom-sm">
            <h2 className="font-semibold text-custom-lg text-dark mb-3">Details</h2>
            <dl className="grid gap-2">
              <div className="flex justify-between gap-4">
                <dt>Payment</dt>
                <dd className="text-dark text-right">
                  {PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Account</dt>
                <dd className="text-dark text-right break-all">
                  {order.user ? `${order.user.name ?? ""} ${order.user.email ? `(${order.user.email})` : ""}`.trim() : "Deleted user"}
                </dd>
              </div>
            </dl>
            {order.notes && (
              <div className="mt-4">
                <p className="font-medium text-dark mb-1">Customer notes</p>
                <p className="whitespace-pre-wrap rounded-lg bg-gray-1 border border-gray-3 p-3">{order.notes}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
