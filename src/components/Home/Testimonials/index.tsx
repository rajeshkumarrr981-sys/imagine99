import Link from "next/link";
import SectionHeading from "@/components/Diwali/SectionHeading";
import Stars from "@/components/Common/Stars";

export type HomeReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  productId: string;
  productTitle: string;
};

/** Recent customer reviews from the database. Hidden until there are some. */
const Testimonials = ({ reviews }: { reviews: HomeReview[] }) => {
  if (reviews.length === 0) return null;
  return (
    <section className="pt-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <SectionHeading eyebrow="Kind words" title="From our customers" align="center" />
        <ul className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-col rounded-2xl bg-white border border-gray-3 p-7 shadow-testimonial">
              <Stars rating={r.rating} size={14} />
              <blockquote className="mt-5 flex-1 font-display text-[19px] leading-[1.55] text-dark">
                &ldquo;{r.comment}&rdquo;
              </blockquote>
              <div className="mt-6 pt-5 border-t border-gray-3 text-custom-sm">
                <p className="font-medium text-dark">{r.userName}</p>
                <Link href={`/shop-details/${r.productId}`} className="text-dark-4 hover:text-blue">
                  on {r.productTitle}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials;
