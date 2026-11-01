import { notFound } from "next/navigation";
import { Metadata } from "next";
import ShopDetails from "@/components/ShopDetails";
import { getProduct, getProducts } from "@/lib/products";
import { currentUser } from "@/lib/auth";
import { Review } from "@/models/Review";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product ? `${product.title} | Imagine99` : "Product not found | Imagine99" };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [me, related, reviewDocs] = await Promise.all([
    currentUser(),
    getProducts({ category: product.category, limit: 9 }),
    Review.find({ product: id }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const reviews = reviewDocs.map((r) => ({
    id: String(r._id),
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.createdAt).toISOString(),
  }));
  const mine = me ? reviewDocs.find((r) => String(r.user) === me.id) : undefined;

  return (
    <main>
      <ShopDetails
        product={product}
        related={related.filter((p) => p.id !== product.id).slice(0, 8)}
        reviews={reviews}
        signedIn={!!me}
        myReview={mine ? { rating: mine.rating, comment: mine.comment } : undefined}
      />
    </main>
  );
}
