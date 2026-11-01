import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { User } from "@/models/User";

const opt = (max: number) => z.string().trim().max(max).optional().default("");

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("profile"), name: z.string().trim().min(2, "Name is too short").max(80) }),
  z.object({
    action: z.literal("address"),
    address: z.object({
      name: opt(100),
      email: opt(200),
      phone: opt(30),
      address: opt(200),
      city: opt(100),
      country: opt(100),
      zip: opt(20),
    }),
  }),
  z.object({
    action: z.literal("password"),
    currentPassword: z.string().optional().default(""),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
  }),
]);

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const body = parsed.data;

  await connectDB();
  if (body.action === "profile") {
    await User.updateOne({ _id: user.id }, { $set: { name: body.name } });
  } else if (body.action === "address") {
    await User.updateOne({ _id: user.id }, { $set: { address: body.address } });
  } else {
    const dbUser = await User.findById(user.id).select("+passwordHash");
    if (!dbUser) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    // Google-only accounts have no password yet and may set one.
    if (dbUser.passwordHash && !(await bcrypt.compare(body.currentPassword, dbUser.passwordHash))) {
      return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
    }
    dbUser.passwordHash = await bcrypt.hash(body.newPassword, 12);
    await dbUser.save();
  }
  return NextResponse.json({ ok: true });
}
