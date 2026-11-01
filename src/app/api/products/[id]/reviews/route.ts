import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ProductModel } from "@/models/Product";
import { Review } from "@/models/Review";
import { refreshProductRating } from "@/lib/reviews";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await connectDB();
  const reviews = await Review.find({ product: id }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: String(r._id),
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  });
}

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "Please write a few words").max(2000),
});

// Create or update the signed-in user's review.
export async function POST(req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to review" }, { status: 401 });

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await connectDB();
  if (!(await ProductModel.exists({ _id: id }))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await Review.updateOne(
    { product: id, user: user.id },
    { $set: { ...parsed.data, userName: user.name ?? "Customer" } },
    { upsert: true }
  );
  await refreshProductRating(id);
  revalidatePath(`/shop-details/${id}`);

  return NextResponse.json({ ok: true });
}
