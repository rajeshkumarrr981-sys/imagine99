import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import {
  adminInputClass,
  formatMoney,
  primaryButtonClass,
  readSupplierSource,
  secondaryButtonClass,
  thumb,
} from "@/components/Admin/format";
import DeleteProductButton from "@/components/Admin/DeleteProductButton";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[]; page?: string | string[] }>;
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

const badgeClass = "inline-block rounded-full px-2 py-0.5 text-custom-xs font-medium";

export default async function AdminProductsPage({ searchParams }: Props) {
  if (!(await requireAdmin())) return <Forbidden />;

  const sp = await searchParams;
  const q = first(sp.q)?.trim().slice(0, 100) ?? "";
  const rawCategory = first(sp.category)?.trim().slice(0, 100) ?? "";
  const requestedPage = Math.max(1, Math.floor(Number(first(sp.page)) || 1));

  await connectDB();
  const allCategories = (await ProductModel.distinct("category"))
    .filter((c): c is string => typeof c === "string" && c.trim() !== "")
    .sort((a, b) => a.localeCompare(b));
  // Only filter by categories that actually exist.
  const category = allCategories.includes(rawCategory) ? rawCategory : "";

  const filter: Record<string, unknown> = {};
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (category) filter.category = category;

  const total = await ProductModel.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);

  const docs = await ProductModel.find(filter)
    .select("title category price discountedPrice stock rating reviewCount images bestseller festive hidden source")
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();
  const products = docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    category: d.category ?? "General",
    price: d.price,
    discountedPrice: d.discountedPrice,
    stock: d.stock ?? 0,
    rating: d.rating ?? 0,
    reviewCount: d.reviewCount ?? 0,
    thumb: thumb(d.images?.thumbnails?.[0] ?? d.images?.previews?.[0] ?? ""),
    bestseller: Boolean(d.bestseller),
    festive: Boolean(d.festive),
    hidden: Boolean(d.hidden),
    supplierBrand: readSupplierSource(d.source)?.brand ?? "",
  }));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };
  const filtered = Boolean(q || category);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="max-w-[1170px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7.5">
        <div>
          <h1 className="font-semibold text-heading-6 text-dark">Products</h1>
          <p className="text-custom-sm text-dark-4 mt-1">
            {total.toLocaleString("en-IN")} {filtered ? "matching" : "total"} {total === 1 ? "product" : "products"}
          </p>
        </div>
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
          <label htmlFor="category" className="sr-only">
            Filter by category
          </label>
          <select id="category" name="category" defaultValue={category} className={`${adminInputClass} max-w-[240px]`}>
            <option value="">All categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className={secondaryButtonClass}>
            Search
          </button>
          {filtered && (
            <Link href="/admin/products" className="self-center text-custom-sm text-blue hover:underline">
              Clear
            </Link>
          )}
        </form>

        {products.length === 0 ? (
          <p className="px-6 py-10 text-center">
            {filtered ? "No products match these filters." : "No products yet."}
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
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-dark hover:text-blue">
                            {p.title}
                          </Link>
                          {(p.supplierBrand || p.bestseller || p.festive || p.hidden) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {p.supplierBrand && (
                                <span className="text-custom-xs text-dark-4" title="Supplier (internal only)">
                                  {p.supplierBrand}
                                </span>
                              )}
                              {p.bestseller && <span className={`${badgeClass} bg-yellow-light-2 text-yellow-dark-2`}>Best seller</span>}
                              {p.festive && <span className={`${badgeClass} bg-red-light-6 text-red`}>Festive</span>}
                              {p.hidden && <span className={`${badgeClass} bg-gray-2 text-dark-4`}>Hidden from shop</span>}
                            </div>
                          )}
                        </div>
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

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-gray-3 text-custom-sm">
            <span>
              Showing {rangeStart.toLocaleString("en-IN")}–{rangeEnd.toLocaleString("en-IN")} of{" "}
              {total.toLocaleString("en-IN")} · Page {page} of {pageCount}
            </span>
            {pageCount > 1 && (
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={hrefFor(page - 1)} className="rounded-lg border border-gray-3 px-3 py-1.5 hover:bg-gray-2">
                    Previous
                  </Link>
                )}
                {page < pageCount && (
                  <Link href={hrefFor(page + 1)} className="rounded-lg border border-gray-3 px-3 py-1.5 hover:bg-gray-2">
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
