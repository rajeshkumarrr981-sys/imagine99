import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["cod", "upi"] as const;
// pending: not paid yet (COD, or UPI not submitted) · submitted: customer entered a UTR · paid: staff confirmed
export const PAYMENT_STATUSES = ["pending", "submitted", "paid", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

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
    taxes: { type: Number, default: 0 },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },
    // "cod" = cash on delivery (orders of ₹2,499+), "upi" = paid by UPI and verified by staff.
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "cod" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
    paymentRef: { type: String, trim: true }, // UPI transaction ID (UTR) entered by the customer
    paymentSubmittedAt: Date,
    paidAt: Date,
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export const Order: Model<OrderDoc> = models.Order || model<OrderDoc>("Order", OrderSchema);
