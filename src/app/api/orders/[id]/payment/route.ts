import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Order } from "@/models/Order";

// UPI transaction IDs (UTR / reference numbers) are usually 12 digits; allow a little leeway.
const schema = z.object({
  utr: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{10,22}$/, "Enter the UPI transaction ID from your payment app (usually 12 digits)"),
});

type Ctx = { params: Promise<{ id: string }> };

/** The customer submits the UPI transaction ID after paying; staff then confirm it in the admin. */
export async function POST(req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await connectDB();
  const updated = await Order.findOneAndUpdate(
    { _id: id, user: user.id, paymentMethod: "upi", paymentStatus: { $in: ["pending", "failed", "submitted"] }, status: { $ne: "cancelled" } },
    { $set: { paymentRef: parsed.data.utr.toUpperCase(), paymentStatus: "submitted", paymentSubmittedAt: new Date() } },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "This order can't take a payment reference" }, { status: 409 });

  revalidatePath(`/orders/${id}`);
  return NextResponse.json({ ok: true });
}
