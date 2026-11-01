import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { User } from "@/models/User";
import { ProductModel } from "@/models/Product";
import { toProduct } from "@/lib/products";

async function wishlistItems(productIds: unknown[]) {
  const docs = await ProductModel.find({ _id: { $in: productIds } }).lean();
  // Keep the user's order.
  const byId = new Map(docs.map((d) => [String(d._id), toProduct(d)]));
  return productIds
    .map((id) => byId.get(String(id)))
    .filter((p) => !!p)
    .map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      discountedPrice: p.discountedPrice,
      quantity: 1,
      stock: p.stock,
      status: p.stock > 0 ? "available" : "out of stock",
      imgs: p.imgs,
    }));
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await connectDB();
  const dbUser = await User.findById(user.id).select("wishlist").lean();
  return NextResponse.json({ items: await wishlistItems(dbUser?.wishlist ?? []) });
}

const putSchema = z.object({
  productIds: z.array(z.string().refine(isValidObjectId)).max(200),
});

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid wishlist" }, { status: 400 });

  await connectDB();
  const ids = Array.from(new Set(parsed.data.productIds));
  const existing = await ProductModel.find({ _id: { $in: ids } }).select("_id").lean();
  const valid = ids.filter((id) => existing.some((e) => String(e._id) === id));
  await User.updateOne({ _id: user.id }, { $set: { wishlist: valid } });
  return NextResponse.json({ ok: true });
}
