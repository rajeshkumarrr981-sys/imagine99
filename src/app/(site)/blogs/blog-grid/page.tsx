import React from "react";
import BlogGrid from "@/components/BlogGrid";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Grid | Imagine99",
  description: "Blog Grid at Imagine99",
  // other metadata
};

const BlogGridPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogGridPage;
