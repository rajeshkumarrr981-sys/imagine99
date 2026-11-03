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

// "featured" = our ranking (see scripts/score-catalog.ts), the default everywhere.
export type ProductSort = "featured" | "latest" | "price-asc" | "price-desc" | "popular";

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

// Products hidden by the ranking script (or the admin) never appear in lists.
const VISIBLE = { hidden: { $ne: true } };

function buildFilter(q: ProductQuery) {
  const filter: Record<string, unknown> = { ...VISIBLE };
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

function buildSort(sort: ProductSort = "featured"): Record<string, 1 | -1> {
  switch (sort) {
    case "price-asc":
      return { discountedPrice: 1, score: -1, _id: 1 };
    case "price-desc":
      return { discountedPrice: -1, score: -1, _id: 1 };
    case "popular":
      return { reviewCount: -1, bestseller: -1, score: -1, _id: 1 };
    case "latest":
      return { publishedAt: -1, _id: 1 };
    default:
      return { score: -1, _id: 1 };
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
  const top = await ProductModel.findOne(category ? { ...VISIBLE, category } : VISIBLE)
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

/** Categories with visible product counts and the image of their top-ranked product. */
export async function getCategories(): Promise<{ name: string; count: number; image?: string }[]> {
  await connectDB();
  const rows = await ProductModel.aggregate<{ _id: string; count: number; image?: string }>([
    { $match: VISIBLE },
    { $sort: { score: -1 } },
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

/** Every category name, including ones whose products are all hidden (for the admin). */
export async function getAllCategoryNames(): Promise<string[]> {
  await connectDB();
  const names = (await ProductModel.distinct("category")) as string[];
  return names.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

/** Number of visible, in-stock products at each price. */
export async function getTierCounts(): Promise<Record<number, number>> {
  await connectDB();
  const rows = await ProductModel.aggregate<{ _id: number; n: number }>([
    { $match: { ...VISIBLE, stock: { $gt: 0 } } },
    { $group: { _id: "$discountedPrice", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n]));
}
