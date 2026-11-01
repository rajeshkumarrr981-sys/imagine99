import "server-only";
import { Types } from "mongoose";
import { Review } from "@/models/Review";
import { ProductModel } from "@/models/Product";

/** Recalculate a product's average rating and review count. */
export async function refreshProductRating(productId: string) {
  const [stats] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await ProductModel.updateOne(
    { _id: productId },
    { $set: { rating: stats ? Math.round(stats.avg * 10) / 10 : 0, reviewCount: stats?.count ?? 0 } }
  );
}
