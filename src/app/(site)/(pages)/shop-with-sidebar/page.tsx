import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getCategories, getProducts, type ProductQuery } from "@/lib/products";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Imagine99",
  description: "Browse all products",
};

export const dynamic = "force-dynamic";

const SORTS = ["latest", "popular", "price-asc", "price-desc"] as const;

export default async function ShopWithSidebarPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; max?: string }>;
}) {
  const { search, category, sort: rawSort, max } = await searchParams;
  const initialMax = Number(max) > 0 ? Number(max) : undefined;
  const sort = (SORTS as readonly string[]).includes(rawSort ?? "") ? (rawSort as ProductQuery["sort"]) : "latest";

  const [products, categories] = await Promise.all([
    getProducts({ search: search?.slice(0, 100), category, sort }),
    getCategories(),
  ]);

  return (
    <main>
      <Suspense>
        <ShopWithSidebar
          products={products}
          categories={categories}
          activeCategory={category}
          search={search}
          sort={sort!}
          initialMax={initialMax}
        />
      </Suspense>
    </main>
  );
}
