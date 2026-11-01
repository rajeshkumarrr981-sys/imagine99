import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// One review per user per product.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;

export const Review: Model<ReviewDoc> = models.Review || model<ReviewDoc>("Review", ReviewSchema);
