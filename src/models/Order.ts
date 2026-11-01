import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    image: String,
    price: { type: Number, required: true }, // unit price charged, copied from the product at order time
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      zip: String,
    },
    notes: String,
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    // No payment provider yet: orders are created unpaid ("pay on delivery").
    paymentMethod: { type: String, default: "cod" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export const Order: Model<OrderDoc> = models.Order || model<OrderDoc>("Order", OrderSchema);
