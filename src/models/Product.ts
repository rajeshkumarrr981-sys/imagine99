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

    // Merchandising flags (set by the catalogue import or the admin).
    bestseller: { type: Boolean, default: false, index: true },
    festive: { type: Boolean, default: false, index: true },
    // When the product first went on sale; used for "new arrivals".
    publishedAt: { type: Date, default: Date.now, index: true },
    // Set by `npm run score`: higher shows first; hidden products stay out of the shop.
    score: { type: Number, default: 0, index: true },
    hidden: { type: Boolean, default: false, index: true },
    // Admin override for the ranking: "show" / "hide" always win over the score.
    visibility: { type: String, enum: ["auto", "show", "hide"], default: "auto" },

    // Supplier details for fulfilment. Admin only: never sent to the storefront.
    source: {
      key: { type: String }, // "<site>:<product id>", unique per supplier product
      brand: String,
      sku: String,
      url: String,
      // the supplier's own product type ("type" needs the object form, or Mongoose
      // reads the whole `source` field as a string)
      type: { type: String },
      mrp: Number, // supplier's MRP
      salePrice: Number, // supplier's own selling price (before our tier pricing)
    },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ "source.key": 1 }, { unique: true, sparse: true });
ProductSchema.index({ category: 1, discountedPrice: 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

export const ProductModel: Model<ProductDoc> =
  models.Product || model<ProductDoc>("Product", ProductSchema);
