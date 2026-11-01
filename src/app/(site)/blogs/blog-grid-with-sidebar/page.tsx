import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog Grid | Imagine99",
  description: "Blog Grid at Imagine99",
  // other metadata
};

const BlogGridWithSidebarPage = async () => {
  const products = await getProducts({ limit: 3 });
  return (
    <>
      <BlogGridWithSidebar products={products} />
    </>
  );
};

export default BlogGridWithSidebarPage;
