import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getCategories, getTierCounts, searchProducts, type ProductSort } from "@/lib/products";
import { PRICE_TIERS } from "@/lib/pricing";
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
  searchParams: Promise<{ search?: string; category?: string; sort?: string; min?: string; max?: string; page?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const sort = (SORTS as string[]).includes(params.sort ?? "") ? (params.sort as ProductSort) : "latest";
  const category = params.category || undefined;
  const search = params.search?.slice(0, 100) || undefined;
  const tier = (PRICE_TIERS as readonly number[]).includes(Number(params.tier)) ? Number(params.tier) : undefined;
  // ?tier= picks one price; ?max= (older links, e.g. "under ₹999") still works as an upper limit.
  const minPrice = tier ?? toNumber(params.min);
  const maxPrice = tier ?? toNumber(params.max);

  const [result, categories, tierCounts] = await Promise.all([
    searchProducts({ search, category, sort, minPrice, maxPrice, page: toNumber(params.page) ?? 1, pageSize: PAGE_SIZE }),
    getCategories(),
    getTierCounts(),
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
          activeTier={tier}
          tierCounts={tierCounts}
        />
      </Suspense>
    </main>
  );
}
