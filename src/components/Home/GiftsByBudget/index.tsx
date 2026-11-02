import Link from "next/link";
import SectionHeading from "@/components/Diwali/SectionHeading";

const budgets = [
  { label: "Under ₹999", note: "Thoughtful little extras", max: 999, tone: "bg-marigold-wash" },
  { label: "Under ₹2,499", note: "For family and close friends", max: 2499, tone: "bg-blue-light-5" },
  { label: "Something special", note: "The gift they will remember", max: null, sort: "price-desc", tone: "bg-gray-2" },
];

/** Gift guide by budget. Each card opens the shop with a price filter applied. */
export default function GiftsByBudget() {
  return (
    <section className="pt-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <SectionHeading eyebrow="Gift guide" title="Gifts for every budget" />
        <ul className="grid md:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <li key={b.label}>
              <Link
                href={b.max ? `/shop-with-sidebar?max=${b.max}` : `/shop-with-sidebar?sort=${b.sort}`}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-3 ${b.tone} p-8 min-h-[200px] ease-out duration-300 hover:border-brass`}
              >
                <span className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full border border-brass/25" aria-hidden="true" />
                <span className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border border-dashed border-brass/30" aria-hidden="true" />
                <span>
                  <span className="block font-display text-[30px] leading-tight text-dark">{b.label}</span>
                  <span className="mt-2 block text-dark-4">{b.note}</span>
                </span>
                <span className="mt-8 inline-flex items-center gap-2 text-custom-sm font-medium text-blue">
                  Browse
                  <span aria-hidden="true" className="ease-out duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
