import Home from "@/components/Home";
import { getCategories, getProducts, getTierCounts } from "@/lib/products";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imagine99 | Diwali gifts, décor and serveware",
  description: "Handcrafted décor, serveware and festive keepsakes for the festival of lights. Everything at ₹149, ₹249 or ₹399.",
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
  const [festive, popular, categories, tierCounts, reviews] = await Promise.all([
    getProducts({ festive: true, limit: 9, inStockOnly: true }),
    getProducts({ bestseller: true, sort: "popular", limit: 16, inStockOnly: true }),
    getCategories(),
    getTierCounts(),
    latestReviews(),
  ]);
  // Each section skips products already shown above it, so nothing appears twice.
  const featured = festive[0] ?? popular[0];
  const newArrivals = festive.filter((p) => p.id !== featured?.id).slice(0, 8);
  const shown = new Set([featured?.id, ...newArrivals.map((p) => p.id)]);
  const bestSellers = popular.filter((p) => !shown.has(p.id)).slice(0, 4);
  return (
    <Home
      featured={featured}
      newArrivals={newArrivals}
      bestSellers={bestSellers.length ? bestSellers : newArrivals.slice(0, 4)}
      categories={categories
        // Skip near-empty categories; festive ones lead during Diwali, then the largest.
        // 8 fill neat rows of 2 or 4.
        .filter((c) => c.count >= 8)
        .sort((x, y) => Number(FESTIVE.includes(y.name)) - Number(FESTIVE.includes(x.name)) || y.count - x.count)
        .slice(0, 8)}
      tierCounts={tierCounts}
      reviews={reviews}
    />
  );
}
