import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General", index: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: {
      thumbnails: { type: [String], default: [] },
      previews: { type: [String], default: [] },
    },
    // Kept in sync whenever a review is added.
    reviewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text" });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

export const ProductModel: Model<ProductDoc> =
  models.Product || model<ProductDoc>("Product", ProductSchema);
