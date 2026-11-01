import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order, ORDER_STATUSES, type OrderStatus } from "@/models/Order";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import { countItems, formatDate, formatMoney } from "@/components/Admin/format";
import OrderStatusSelect from "@/components/Admin/OrderStatusSelect";

export const metadata: Metadata = { title: "Orders" };

const PAGE_SIZE = 25;

type Props = { searchParams: Promise<{ status?: string | string[]; page?: string | string[] }> };

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default async function AdminOrdersPage({ searchParams }: Props) {
  if (!(await requireAdmin())) return <Forbidden />;

  const sp = await searchParams;
  const rawStatus = first(sp.status);
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus) ? (rawStatus as OrderStatus) : undefined;
  const page = Math.max(1, Math.floor(Number(first(sp.page)) || 1));

  await connectDB();
  const filter = status ? { status } : {};
  const [total, docs, statusCounts] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate<{ user: { name?: string; email?: string } | null }>("user", "name email")
      .lean(),
    Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(statusCounts.map((r) => [r._id, r.count])) as Record<string, number>;
  const allCount = statusCounts.reduce((sum, r) => sum + r.count, 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const orders = docs.map((o) => ({
    id: String(o._id),
    name: o.shippingAddress?.name || o.user?.name || "—",
    email: o.shippingAddress?.email || o.user?.email || "",
    itemCount: countItems(o.items),
    total: o.total,
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
  }));

  const hrefFor = (s?: string, p?: number) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (p && p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const tabs = [{ value: undefined, label: "All", count: allCount }].concat(
    ORDER_STATUSES.map((s) => ({ value: s, label: s, count: counts[s] ?? 0 }))
  );

  return (
    <div className="max-w-[1170px] mx-auto">
      <h1 className="font-semibold text-heading-6 text-dark mb-7.5">Orders</h1>

      <div className="rounded-xl bg-white shadow-1">
        <nav aria-label="Filter by status" className="flex gap-2 overflow-x-auto p-5 border-b border-gray-3">
          {tabs.map((t) => {
            const active = t.value === status;
            return (
              <Link
                key={t.label}
                href={hrefFor(t.value)}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-custom-sm font-medium capitalize ease-out duration-200 ${
                  active ? "bg-dark text-white" : "bg-gray-2 text-dark hover:bg-gray-3"
                }`}
              >
                {t.label} <span className={active ? "text-gray-4" : "text-dark-4"}>({t.count})</span>
              </Link>
            );
          })}
        </nav>

        {orders.length === 0 ? (
          <p className="px-6 py-10 text-center">{status ? `No ${status} orders.` : "No orders yet."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-custom-sm">
              <thead className="text-dark-4">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-3 align-top">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-dark hover:text-blue">
                        #{o.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-dark">{o.name}</p>
                      {o.email && <p className="text-custom-xs text-dark-4">{o.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-right">{o.itemCount}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap text-dark">{formatMoney(o.total)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(o.createdAt, true)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusSelect
                        orderId={o.id}
                        status={o.status}
                        statuses={ORDER_STATUSES}
                        label={`Status of order ${o.id.slice(-6).toUpperCase()}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-gray-3 text-custom-sm">
            <span>
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={hrefFor(status, page - 1)} className="rounded-lg border border-gray-3 px-3 py-1.5 hover:bg-gray-2">
                  Previous
                </Link>
              )}
              {page < pageCount && (
                <Link href={hrefFor(status, page + 1)} className="rounded-lg border border-gray-3 px-3 py-1.5 hover:bg-gray-2">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
