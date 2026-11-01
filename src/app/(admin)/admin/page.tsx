import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import { formatDate, formatMoney } from "@/components/Admin/format";
import StatusBadge from "@/components/Admin/StatusBadge";

const LOW_STOCK = 5;

export default async function AdminDashboardPage() {
  if (!(await requireAdmin())) return <Forbidden />;

  await connectDB();
  const [productCount, orderCount, customerCount, revenueRows, lowStock, recentOrders] = await Promise.all([
    ProductModel.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: { $ne: "admin" } }),
    Order.aggregate<{ total: number }>([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    ProductModel.find({ stock: { $lte: LOW_STOCK } })
      .sort({ stock: 1, title: 1 })
      .limit(20)
      .select("title stock category")
      .lean(),
    Order.find().sort({ createdAt: -1 }).limit(5).select("shippingAddress total status createdAt items").lean(),
  ]);
  const revenue = revenueRows[0]?.total ?? 0;

  const stats = [
    { label: "Revenue", value: formatMoney(revenue), hint: "Excludes cancelled orders" },
    { label: "Orders", value: orderCount.toLocaleString("en-IN"), href: "/admin/orders" },
    { label: "Products", value: productCount.toLocaleString("en-IN"), href: "/admin/products" },
    { label: "Customers", value: customerCount.toLocaleString("en-IN") },
  ];

  return (
    <div className="max-w-[1170px] mx-auto">
      <h1 className="font-semibold text-heading-6 text-dark mb-7.5">Dashboard</h1>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-7.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white shadow-1 p-6">
            <p className="text-custom-sm text-dark-4 mb-1">{s.label}</p>
            <p className="font-semibold text-custom-2xl text-dark">{s.value}</p>
            {s.href ? (
              <Link href={s.href} className="text-custom-xs text-blue hover:underline">
                View all
              </Link>
            ) : s.hint ? (
              <p className="text-custom-xs text-dark-4">{s.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-7.5 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-xl bg-white shadow-1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3">
            <h2 className="font-semibold text-custom-lg text-dark">Recent orders</h2>
            <Link href="/admin/orders" className="text-custom-sm text-blue hover:underline">
              All orders
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-custom-sm">
                <thead className="text-dark-4">
                  <tr>
                    <th className="px-6 py-3 font-medium">Order</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const id = String(o._id);
                    return (
                      <tr key={id} className="border-t border-gray-3">
                        <td className="px-6 py-3">
                          <Link href={`/admin/orders/${id}`} className="font-medium text-dark hover:text-blue">
                            #{id.slice(-6).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-6 py-3">{o.shippingAddress?.name ?? "—"}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                        <td className="px-6 py-3 text-right text-dark">{formatMoney(o.total)}</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white shadow-1">
          <div className="px-6 py-4 border-b border-gray-3">
            <h2 className="font-semibold text-custom-lg text-dark">Low stock</h2>
            <p className="text-custom-xs text-dark-4">{LOW_STOCK} or fewer left</p>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-6 py-8 text-center">All products are well stocked.</p>
          ) : (
            <ul>
              {lowStock.map((p) => {
                const id = String(p._id);
                return (
                  <li key={id} className="flex items-center justify-between gap-3 px-6 py-3 border-t border-gray-3 first:border-t-0">
                    <Link href={`/admin/products/${id}/edit`} className="text-custom-sm text-dark hover:text-blue truncate">
                      {p.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-custom-xs font-medium ${
                        (p.stock ?? 0) === 0 ? "bg-red-light-6 text-red" : "bg-yellow-light-2 text-yellow-dark-2"
                      }`}
                    >
                      {(p.stock ?? 0) === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
