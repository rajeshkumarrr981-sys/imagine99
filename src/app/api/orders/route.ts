import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ProductModel } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { COD_MIN_ORDER, money, orderTotals } from "@/lib/pricing";
import { sendOrderConfirmation } from "@/lib/mail";

const text = (max: number) => z.string().trim().min(1, "Required").max(max);

const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().refine(isValidObjectId, "Invalid product"),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, "Your cart is empty")
    .max(50),
  shippingAddress: z.object({
    name: text(100),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().max(30).optional().default(""),
    address: text(200),
    city: text(100),
    country: text(100),
    zip: z.string().trim().max(20).optional().default(""),
  }),
  notes: z.string().trim().max(1000).optional().default(""),
  saveAddress: z.boolean().optional().default(false),
  paymentMethod: z.enum(["cod", "upi"]).default("upi"),
});

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await connectDB();
  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
  }
  const { shippingAddress, notes, saveAddress, paymentMethod } = parsed.data;

  // Merge duplicate lines.
  const qtyById = new Map<string, number>();
  for (const i of parsed.data.items) qtyById.set(i.id, (qtyById.get(i.id) ?? 0) + i.quantity);

  await connectDB();
  const products = await ProductModel.find({ _id: { $in: Array.from(qtyById.keys()) } }).lean();
  if (products.length !== qtyById.size) {
    return NextResponse.json({ error: "Some products in your cart no longer exist" }, { status: 409 });
  }

  // Totals always come from database prices, never from the client.
  const preview = orderTotals(products.map((p) => ({ price: p.discountedPrice, quantity: qtyById.get(String(p._id))! })));
  if (paymentMethod === "cod" && !preview.codAllowed) {
    return NextResponse.json(
      { error: `Cash on delivery is available on orders of ${money(COD_MIN_ORDER)} or more. Please pay by UPI.` },
      { status: 400 }
    );
  }

  // Reserve stock one product at a time; undo if any item is short.
  const reserved: { id: string; qty: number }[] = [];
  for (const p of products) {
    const qty = qtyById.get(String(p._id))!;
    const res = await ProductModel.updateOne({ _id: p._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
    if (res.modifiedCount !== 1) {
      await Promise.all(reserved.map((r) => ProductModel.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
      return NextResponse.json(
        { error: `Not enough stock for "${p.title}" (only ${p.stock} left)` },
        { status: 409 }
      );
    }
    reserved.push({ id: String(p._id), qty });
  }

  // Prices always come from the database, never from the client.
  const items = products.map((p) => ({
    product: p._id,
    title: p.title,
    image: p.images?.thumbnails?.[0] ?? p.images?.previews?.[0],
    price: p.discountedPrice,
    quantity: qtyById.get(String(p._id))!,
  }));
  const { subtotal, taxes, shipping: shippingCost, total } = orderTotals(items.map((i) => ({ price: i.price, quantity: i.quantity })));

  let order;
  try {
    order = await Order.create({
      user: user.id,
      items,
      shippingAddress,
      notes,
      subtotal,
      taxes,
      shippingCost,
      total,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
    });
  } catch (err) {
    await Promise.all(reserved.map((r) => ProductModel.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
    throw err;
  }

  if (saveAddress) {
    await User.updateOne({ _id: user.id }, { $set: { address: shippingAddress } });
  }

  await sendOrderConfirmation({
    id: String(order._id),
    items: items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
    subtotal,
    taxes,
    shippingCost,
    total: order.total,
    paymentMethod,
    shippingAddress,
  });

  return NextResponse.json({ id: String(order._id) }, { status: 201 });
}
