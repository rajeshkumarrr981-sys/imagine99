import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AddressSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    country: String,
    zip: String,
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Empty for users who only sign in with Google.
    passwordHash: { type: String, select: false },
    image: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    address: AddressSchema,
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> = models.User || model<UserDoc>("User", UserSchema);
