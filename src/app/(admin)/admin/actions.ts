"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { Order, ORDER_STATUSES } from "@/models/Order";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { getVerifiedAdmin } from "@/components/Admin/guard";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Every action calls this first. Throws for anyone who isn't an admin. */
async function assertAdmin() {
  const admin = await getVerifiedAdmin(); // currentAdmin() + DB role re-check
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

// Storefront renders product images with next/image and next.config has no
// images.remotePatterns, so only site-relative paths (e.g. /images/products/x.png)
// are accepted. Widen this regex if remote hosts get configured.
const IMAGE_PATH = /^\/(?!\/)[^\s]*$/;

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const money = (label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: `${label} must be a number` })
      .min(0, `${label} can't be negative`)
      .max(1_000_000, `${label} is too large`)
  );

const imageList = z
  .string()
  .transform((s) =>
    s
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  )
  .pipe(
    z
      .array(z.string().max(500).regex(IMAGE_PATH, "Image paths must start with / (e.g. /images/products/product-1-bg-1.png)"))
      .max(10, "At most 10 images")
  );

const productSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000),
    category: z.string().trim().min(1, "Category is required").max(100),
    price: money("Price"),
    discountedPrice: money("Discounted price"),
    stock: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number({ error: "Stock must be a number" })
        .int("Stock must be a whole number")
        .min(0, "Stock can't be negative")
        .max(1_000_000)
    ),
    previews: imageList.refine((list) => list.length > 0, "Add at least one image"),
    thumbnails: imageList,
  })
  .refine((d) => d.discountedPrice <= d.price, {
    path: ["discountedPrice"],
    message: "Discounted price must be less than or equal to price",
  });

export type ProductFormValues = {
  title: string;
  description: string;
  category: string;
  price: string;
  discountedPrice: string;
  stock: string;
  previews: string;
  thumbnails: string;
};

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ProductFormValues, string>>;
  values?: ProductFormValues;
};

function readProductForm(formData: FormData): ProductFormValues {
  const get = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  return {
    title: get("title"),
    description: get("description"),
    category: get("category"),
    price: get("price"),
    discountedPrice: get("discountedPrice"),
    stock: get("stock"),
    previews: get("previews"),
    thumbnails: get("thumbnails"),
  };
}

function revalidateProduct(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop-with-sidebar");
  revalidatePath("/shop-without-sidebar");
  revalidatePath("/shop-details/[id]", "page");
  if (id) {
    revalidatePath(`/shop-details/${id}`);
    revalidatePath(`/admin/products/${id}/edit`);
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/**
 * Create (productId undefined) or update a product. Bind the id:
 * `saveProduct.bind(null, id)`, then use with useActionState.
 */
export async function saveProduct(
  productId: string | undefined,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await assertAdmin();

  const values = readProductForm(formData);
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ProductFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ProductFormValues;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const d = parsed.data;
  const doc = {
    title: d.title,
    description: d.description,
    category: d.category,
    price: d.price,
    discountedPrice: d.discountedPrice,
    stock: d.stock,
    images: {
      previews: d.previews,
      thumbnails: d.thumbnails.length ? d.thumbnails : d.previews,
    },
  };

  await connectDB();
  let id = productId;
  if (productId) {
    if (!isValidObjectId(productId)) return { error: "Invalid product id.", values };
    const updated = await ProductModel.findByIdAndUpdate(productId, { $set: doc }, { runValidators: true });
    if (!updated) return { error: "This product no longer exists.", values };
  } else {
    const created = await ProductModel.create(doc);
    id = String(created._id);
  }

  revalidateProduct(id);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (!isValidObjectId(productId)) return { ok: false, error: "Invalid product id." };

  await connectDB();
  const deleted = await ProductModel.findByIdAndDelete(productId);
  if (!deleted) return { ok: false, error: "Product not found." };

  // Orders keep their own title/image/price snapshot, so they're left alone.
  await Promise.all([
    Review.deleteMany({ product: productId }),
    User.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } }),
  ]);

  revalidateProduct(productId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const orderStatusSchema = z.object({
  orderId: z.string().refine((id) => isValidObjectId(id), "Invalid order id"),
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();

  const parsed = orderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  // Stock is reserved at checkout. Cancelling returns it, so a cancelled
  // order is final (reopening it could oversell).
  const previous = await Order.findOneAndUpdate(
    { _id: parsed.data.orderId, status: { $ne: "cancelled" } },
    { $set: { status: parsed.data.status } },
    { runValidators: true }
  );
  if (!previous) {
    const existing = await Order.findById(parsed.data.orderId).select("status").lean();
    if (!existing) return { ok: false, error: "Order not found." };
    if (parsed.data.status !== "cancelled") {
      return { ok: false, error: "Cancelled orders can't be reopened." };
    }
    return { ok: true };
  }
  if (parsed.data.status === "cancelled") {
    await Promise.all(
      previous.items.map((item) =>
        ProductModel.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
      )
    );
    revalidatePath("/shop-with-sidebar");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/my-account");
  return { ok: true };
}
