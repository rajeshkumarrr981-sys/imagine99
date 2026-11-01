import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/products";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";
import ProductForm from "@/components/Admin/ProductForm";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  if (!(await requireAdmin())) return <Forbidden />;

  const categories = (await getCategories()).map((c) => c.name).filter(Boolean);

  return (
    <div className="max-w-[800px] mx-auto">
      <Link href="/admin/products" className="text-custom-sm text-blue hover:underline">
        ← Products
      </Link>
      <h1 className="font-semibold text-heading-6 text-dark mt-2 mb-7.5">New product</h1>
      <div className="rounded-xl bg-white shadow-1 p-5 sm:p-7.5">
        <ProductForm
          categories={categories}
          initial={{
            title: "",
            description: "",
            category: "",
            price: "",
            discountedPrice: "",
            stock: "0",
            previews: "",
            thumbnails: "",
          }}
        />
      </div>
    </div>
  );
}
