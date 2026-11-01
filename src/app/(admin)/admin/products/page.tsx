import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import { adminInputClass, formatMoney, primaryButtonClass, secondaryButtonClass } from "@/components/Admin/format";
import DeleteProductButton from "@/components/Admin/DeleteProductButton";

export const metadata: Metadata = { title: "Products" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  if (!(await requireAdmin())) return <Forbidden />;

  const { q: rawQ } = await searchParams;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim().slice(0, 100) ?? "";

  await connectDB();
  const filter = q ? { title: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
  const docs = await ProductModel.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  const products = docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    category: d.category ?? "General",
    price: d.price,
    discountedPrice: d.discountedPrice,
    stock: d.stock ?? 0,
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    thumb: d.images?.thumbnails?.[0] ?? d.images?.previews?.[0] ?? "",
  }));

  return (
    <div className="max-w-[1170px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7.5">
        <h1 className="font-semibold text-heading-6 text-dark">Products</h1>
        <Link href="/admin/products/new" className={primaryButtonClass}>
          + New product
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-1">
        <form method="get" className="flex flex-wrap gap-3 p-5 border-b border-gray-3" role="search">
          <label htmlFor="q" className="sr-only">
            Search by title
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by title..."
            className={`${adminInputClass} max-w-[360px]`}
          />
          <button type="submit" className={secondaryButtonClass}>
            Search
          </button>
          {q && (
            <Link href="/admin/products" className="self-center text-custom-sm text-blue hover:underline">
              Clear
            </Link>
          )}
        </form>

        {products.length === 0 ? (
          <p className="px-6 py-10 text-center">
            {q ? `No products match "${q}".` : "No products yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-custom-sm">
              <thead className="text-dark-4">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Discounted</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Rating</th>
                  <th className="px-5 py-3 font-medium text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-3">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-2 overflow-hidden flex items-center justify-center">
                          {p.thumb && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumb} alt="" className="w-full h-full object-contain" loading="lazy" />
                          )}
                        </div>
                        <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-dark hover:text-blue">
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3">{p.category}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">{formatMoney(p.price)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap text-dark">{formatMoney(p.discountedPrice)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={p.stock === 0 ? "text-red font-medium" : p.stock <= 5 ? "text-yellow-dark-2 font-medium" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {p.reviewCount > 0 ? `${p.rating.toFixed(1)} (${p.reviewCount})` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-custom-sm font-medium text-blue hover:text-blue-dark">
                          Edit
                        </Link>
                        <DeleteProductButton id={p.id} title={p.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
