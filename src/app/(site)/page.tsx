import Home from "@/components/Home";
import { getCategories, getProducts } from "@/lib/products";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imagine99 | Diwali gifts and gadgets",
  description: "Considered tech and keepsakes for the festival of lights, with cash on delivery.",
};

// Always show current products and stock.
export const dynamic = "force-dynamic";

async function latestReviews() {
  await connectDB();
  const docs = await Review.find({ rating: { $gte: 4 } }).sort({ createdAt: -1 }).limit(3).lean();
  const products = await ProductModel.find({ _id: { $in: docs.map((d) => d.product) } })
    .select("title")
    .lean();
  const titles = new Map(products.map((p) => [String(p._id), p.title]));
  return docs
    .filter((d) => titles.has(String(d.product)))
    .map((d) => ({
      id: String(d._id),
      userName: d.userName,
      rating: d.rating,
      comment: d.comment,
      productId: String(d.product),
      productTitle: titles.get(String(d.product))!,
    }));
}

export default async function HomePage() {
  const [newArrivals, bestSellers, categories, reviews] = await Promise.all([
    getProducts({ sort: "latest", limit: 8 }),
    getProducts({ sort: "popular", limit: 4 }),
    getCategories(),
    latestReviews(),
  ]);
  return <Home newArrivals={newArrivals} bestSellers={bestSellers} categories={categories} reviews={reviews} />;
}
