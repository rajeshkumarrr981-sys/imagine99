import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getCategories, getPriceCeiling, searchProducts, type ProductSort } from "@/lib/products";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Imagine99",
  description: "Browse décor, serveware, lighting and festive gifts",
};

export const dynamic = "force-dynamic";

const SORTS: ProductSort[] = ["latest", "popular", "price-asc", "price-desc"];
const PAGE_SIZE = 24;

const toNumber = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export default async function ShopWithSidebarPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; min?: string; max?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sort = (SORTS as string[]).includes(params.sort ?? "") ? (params.sort as ProductSort) : "latest";
  const category = params.category || undefined;
  const search = params.search?.slice(0, 100) || undefined;
  const minPrice = toNumber(params.min);
  const maxPrice = toNumber(params.max);

  const [result, categories, priceCeiling] = await Promise.all([
    searchProducts({ search, category, sort, minPrice, maxPrice, page: toNumber(params.page) ?? 1, pageSize: PAGE_SIZE }),
    getCategories(),
    getPriceCeiling(category),
  ]);

  return (
    <main>
      <Suspense>
        <ShopWithSidebar
          products={result.items}
          total={result.total}
          page={result.page}
          pages={result.pages}
          pageSize={result.pageSize}
          categories={categories}
          activeCategory={category}
          search={search}
          sort={sort}
          priceCeiling={Math.max(priceCeiling, 100)}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </Suspense>
    </main>
  );
}
