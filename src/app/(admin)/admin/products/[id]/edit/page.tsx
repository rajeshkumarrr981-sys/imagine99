import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCategories } from "@/lib/products";
import { ProductModel } from "@/models/Product";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import ProductForm from "@/components/Admin/ProductForm";
import DeleteProductButton from "@/components/Admin/DeleteProductButton";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  if (!(await requireAdmin())) return <Forbidden />;

  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDB();
  const [product, categoryRows] = await Promise.all([ProductModel.findById(id).lean(), getCategories()]);
  if (!product) notFound();

  const previews = product.images?.previews ?? [];
  const thumbnails = product.images?.thumbnails ?? [];
  const sameImages = previews.length === thumbnails.length && previews.every((p, i) => p === thumbnails[i]);

  return (
    <div className="max-w-[800px] mx-auto">
      <Link href="/admin/products" className="text-custom-sm text-blue hover:underline">
        ← Products
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-7.5">
        <h1 className="font-semibold text-heading-6 text-dark">Edit product</h1>
        <div className="flex items-center gap-5">
          <Link href={`/shop-details/${id}`} target="_blank" className="text-custom-sm font-medium text-blue hover:text-blue-dark">
            View in store ↗
          </Link>
          <DeleteProductButton id={id} title={product.title} redirectTo="/admin/products" />
        </div>
      </div>
      <div className="rounded-xl bg-white shadow-1 p-5 sm:p-7.5">
        <ProductForm
          productId={id}
          categories={categoryRows.map((c) => c.name).filter(Boolean)}
          initial={{
            title: product.title ?? "",
            description: product.description ?? "",
            category: product.category ?? "",
            price: String(product.price ?? ""),
            discountedPrice: String(product.discountedPrice ?? ""),
            stock: String(product.stock ?? 0),
            previews: previews.join("\n"),
            // Leave empty when identical, so editing previews keeps thumbnails in sync.
            thumbnails: sameImages ? "" : thumbnails.join("\n"),
          }}
        />
      </div>
    </div>
  );
}
