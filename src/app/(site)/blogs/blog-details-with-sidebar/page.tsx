import React from "react";
import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar";

import { Metadata } from "next";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog Details | Imagine99",
  description: "Blog Details at Imagine99",
  // other metadata
};

const BlogDetailsWithSidebarPage = async () => {
  const products = await getProducts({ limit: 3 });
  return (
    <main>
      <BlogDetailsWithSidebar products={products} />
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
