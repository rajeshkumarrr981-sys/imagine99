import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";

import { Metadata } from "next";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop | Imagine99",
  description: "Shop at Imagine99",
  // other metadata
};

const ShopWithoutSidebarPage = async () => {
  const products = await getProducts({ limit: 48 });
  return (
    <main>
      <ShopWithoutSidebar products={products} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
