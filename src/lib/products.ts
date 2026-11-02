import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import type { Product } from "@/types/product";

// Only these fields go to the storefront. Supplier details (`source`) never leave the server.
const PUBLIC_FIELDS = "title description category price discountedPrice stock images reviewCount rating";

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

export type ProductSort = "latest" | "price-asc" | "price-desc" | "popular";

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  bestseller?: boolean;
  festive?: boolean;
  inStockOnly?: boolean;
  limit?: number;
  page?: number; // 1-based
};

function buildFilter(q: ProductQuery) {
  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.bestseller) filter.bestseller = true;
  if (q.festive) filter.festive = true;
  if (q.inStockOnly) filter.stock = { $gt: 0 };
  if (q.search) {
    const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }
  if (q.minPrice != null || q.maxPrice != null) {
    filter.discountedPrice = {
      ...(q.minPrice != null ? { $gte: q.minPrice } : {}),
      ...(q.maxPrice != null ? { $lte: q.maxPrice } : {}),
    };
  }
  return filter;
}

function buildSort(sort: ProductSort = "latest"): Record<string, 1 | -1> {
  switch (sort) {
    case "price-asc":
      return { discountedPrice: 1, _id: 1 };
    case "price-desc":
      return { discountedPrice: -1, _id: 1 };
    case "popular":
      return { reviewCount: -1, bestseller: -1, publishedAt: -1, _id: 1 };
    default:
      return { publishedAt: -1, _id: 1 };
  }
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find(buildFilter(query))
    .select(PUBLIC_FIELDS)
    .sort(buildSort(query.sort))
    .limit(query.limit ?? 24)
    .lean();
  return docs.map(toProduct);
}

/** One page of products plus the total count, for the shop. */
export async function searchProducts(query: ProductQuery & { pageSize?: number }) {
  await connectDB();
  const pageSize = query.pageSize ?? 24;
  const filter = buildFilter(query);
  const total = await ProductModel.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const docs = await ProductModel.find(filter)
    .select(PUBLIC_FIELDS)
    .sort(buildSort(query.sort))
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return { items: docs.map(toProduct), total, page, pages, pageSize };
}

/** Highest selling price, optionally within a category (for the price slider). */
export async function getPriceCeiling(category?: string): Promise<number> {
  await connectDB();
  const top = await ProductModel.findOne(category ? { category } : {})
    .select("discountedPrice")
    .sort({ discountedPrice: -1 })
    .lean();
  return Math.ceil(top?.discountedPrice ?? 0);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await ProductModel.findById(id).select(PUBLIC_FIELDS).lean();
  return doc ? toProduct(doc) : null;
}

/** Categories with product counts and a representative image (a best seller where possible). */
export async function getCategories(): Promise<{ name: string; count: number; image?: string }[]> {
  await connectDB();
  const rows = await ProductModel.aggregate<{ _id: string; count: number; image?: string }>([
    { $sort: { bestseller: -1, reviewCount: -1, publishedAt: -1 } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        image: { $first: { $arrayElemAt: ["$images.previews", 0] } },
      },
    },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ name: r._id, count: r.count, image: r.image ?? undefined }));
}
