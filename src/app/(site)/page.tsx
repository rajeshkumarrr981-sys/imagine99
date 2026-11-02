import Home from "@/components/Home";
import { getCategories, getProducts } from "@/lib/products";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imagine99 | Diwali gifts, décor and serveware",
  description: "Handcrafted décor, serveware and festive keepsakes for the festival of lights, with cash on delivery.",
};

const FESTIVE = ["Pooja Essentials", "Festive Gifting", "Lighting & Candles"];

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
  const [newArrivals, bestSellers, festivePicks, categories, reviews] = await Promise.all([
    getProducts({ festive: true, sort: "latest", limit: 8, inStockOnly: true }),
    getProducts({ bestseller: true, sort: "popular", limit: 4, inStockOnly: true }),
    getProducts({ festive: true, bestseller: true, sort: "latest", limit: 1, inStockOnly: true }),
    getCategories(),
    latestReviews(),
  ]);
  return (
    <Home
      featured={festivePicks[0] ?? bestSellers[0] ?? newArrivals[0]}
      newArrivals={newArrivals}
      bestSellers={bestSellers.length ? bestSellers : newArrivals.slice(0, 4)}
      categories={[...categories]
        // Festive categories lead during Diwali, then the largest; 12 fit two neat rows.
        .sort((x, y) => Number(FESTIVE.includes(y.name)) - Number(FESTIVE.includes(x.name)) || y.count - x.count)
        .slice(0, 12)}
      reviews={reviews}
    />
  );
}
