"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import { PRICE_TIERS, money } from "@/lib/pricing";
import Pagination from "./Pagination";
import SingleGridItem from "../Shop/SingleGridItem";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  categories: { name: string; count: number }[];
  activeCategory?: string;
  search?: string;
  sort: string;
  activeTier?: number;
  tierCounts: Record<number, number>;
};

const sortOptions = [
  { label: "Recommended", value: "featured" },
  { label: "Newest first", value: "latest" },
  { label: "Best selling", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const ShopWithSidebar = ({
  products,
  total,
  page,
  pages,
  pageSize,
  categories,
  activeCategory,
  search,
  sort,
  activeTier,
  tierCounts,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  // Category, search, sort, price and page live in the URL; the server does the filtering.
  const updateQuery = (changes: Record<string, string | undefined>, keepPage = false) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!keepPage) params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/shop-with-sidebar?${qs}` : "/shop-with-sidebar", { scroll: keepPage });
  };

  const clearAll = () => router.push("/shop-with-sidebar");

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  useEffect(() => {
    const handleStickyMenu = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  return (
    <>
      <Breadcrumb
        title={activeCategory ?? (search ? `Results for “${search}”` : activeTier ? `Everything at ${money(activeTier)}` : "The Diwali shop")}
        pages={activeCategory ? ["Shop", activeCategory] : ["Shop"]}
      />
      <section className="overflow-hidden relative pb-20 pt-10 lg:pt-14 bg-ivory">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-visible-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                // Close handle while the panel is open; the "Filters" button in the top bar opens it.
                className={`${productSidebar ? "flex" : "hidden"} xl:hidden absolute -right-12.5 sm:-right-8 items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z"
                    fill=""
                  />
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* <!-- filter box --> */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filters:</p>
                      <button type="button" onClick={clearAll} className="text-blue">Clean All</button>
                    </div>
                  </div>

                  {/* <!-- category box --> */}
                  <CategoryDropdown
                    categories={categories}
                    active={activeCategory}
                    onSelect={(category) => updateQuery({ category })}
                  />

                  {/* // <!-- price range box --> */}
                  <div className="bg-white shadow-1 rounded-lg">
                    <p className="text-dark py-3 pl-6 pr-5.5 shadow-filter">Price</p>
                    <div className="flex flex-col gap-2.5 py-5 px-6">
                      {PRICE_TIERS.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => updateQuery({ tier: activeTier === tier ? undefined : String(tier), min: undefined, max: undefined })}
                          className={`flex items-center justify-between rounded-full border px-4 py-2 text-custom-sm ease-out duration-200 ${
                            activeTier === tier ? "border-blue bg-blue text-white" : "border-gray-3 text-dark hover:border-brass"
                          }`}
                        >
                          <span>Everything {money(tier)}</span>
                          <span className={activeTier === tier ? "text-white/80" : "text-dark-4"}>{tierCounts[tier] ?? 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* <!-- top bar left --> */}
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setProductSidebar(true)}
                      className="xl:hidden inline-flex items-center gap-2 rounded-md border border-gray-3 bg-gray-1 px-3.5 py-2 text-custom-sm font-medium text-dark ease-out duration-200 hover:border-blue hover:text-blue"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                        <path d="M4 6h16M7 12h10M10 18h4" />
                      </svg>
                      Filters
                    </button>
                    <CustomSelect
                      options={sortOptions}
                      value={sort}
                      onChange={(value) => updateQuery({ sort: value === "featured" ? undefined : value })}
                    />

                    <p>
                      Showing <span className="text-dark">{from}–{to}</span> of <span className="text-dark">{total.toLocaleString("en-IN")}</span>
                      {search && (
                        <> for &ldquo;<span className="text-dark">{search}</span>&rdquo;</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-7.5 sm:gap-y-9">
                {products.map((item) => (
                  <SingleGridItem item={item} key={item.id} />
                ))}
              </div>
              {/* <!-- Products Grid Tab Content End --> */}

              {products.length === 0 && (
                <p className="py-16 text-center text-dark-4">No products match these filters.</p>
              )}

              <Pagination
                page={page}
                pages={pages}
                onChange={(p) => {
                  updateQuery({ page: p > 1 ? String(p) : undefined }, true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
