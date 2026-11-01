import BlogDetails from "@/components/BlogDetails";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Details | Imagine99",
  description: "Blog Details at Imagine99",
  // other metadata
};

const BlogDetailsPage = () => {
  return (
    <main>
      <BlogDetails />
    </main>
  );
};

export default BlogDetailsPage;
