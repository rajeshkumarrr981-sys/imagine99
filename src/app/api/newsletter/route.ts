import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email").max(200) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await connectDB();
  // Same response whether or not the address was already on the list.
  await Subscriber.updateOne({ email: parsed.data.email }, { $setOnInsert: { email: parsed.data.email } }, { upsert: true });
  return NextResponse.json({ ok: true });
}
