import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import type { Product } from "@/types/product";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProduct(doc: any): Product {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    category: doc.category ?? "General",
    price: doc.price,
    discountedPrice: doc.discountedPrice,
    stock: doc.stock ?? 0,
    reviews: doc.reviewCount ?? 0,
    rating: doc.rating ?? 0,
    imgs: {
      thumbnails: doc.images?.thumbnails ?? [],
      previews: doc.images?.previews ?? [],
    },
  };
}

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: "latest" | "price-asc" | "price-desc" | "popular";
  limit?: number;
};

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }

  const sort: Record<string, 1 | -1> =
    query.sort === "price-asc"
      ? { discountedPrice: 1 }
      : query.sort === "price-desc"
        ? { discountedPrice: -1 }
        : query.sort === "popular"
          ? { reviewCount: -1 }
          : { createdAt: -1 };

  const docs = await ProductModel.find(filter)
    .sort(sort)
    .limit(query.limit ?? 100)
    .lean();
  return docs.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await ProductModel.findById(id).lean();
  return doc ? toProduct(doc) : null;
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  await connectDB();
  const rows = await ProductModel.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ name: r._id, count: r.count }));
}
