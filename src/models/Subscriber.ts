import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export type SubscriberDoc = InferSchemaType<typeof SubscriberSchema>;

export const Subscriber: Model<SubscriberDoc> =
  models.Subscriber || model<SubscriberDoc>("Subscriber", SubscriberSchema);
