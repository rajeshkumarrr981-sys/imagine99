import Link from "next/link";
import { PRICE_TIERS, money } from "@/lib/pricing";

/** "Everything at ₹149 / ₹249 / ₹399" circles. Each opens the shop at that price. */
export default function PriceTiers({ counts }: { counts: Record<number, number> }) {
  return (
    <section className="pt-16">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="text-center">
          <p className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-brass/60" />
            Shop by price
            <span className="h-px w-8 bg-brass/60" />
          </p>
          <h2 className="mt-3 text-[30px] sm:text-[38px] leading-[1.15] text-dark">Everything at three prices</h2>
        </div>

        <ul className="mt-10 grid grid-cols-3 gap-4 sm:gap-10 max-w-[760px] mx-auto">
          {PRICE_TIERS.map((tier) => (
            <li key={tier}>
              <Link href={`/shop-with-sidebar?tier=${tier}`} className="group flex flex-col items-center text-center">
                <span className="relative flex flex-col items-center justify-center w-[96px] h-[96px] sm:w-[150px] sm:h-[150px] rounded-full shadow-2 ease-out duration-300 group-hover:-translate-y-1 group-hover:shadow-glow"
                  style={{ background: "radial-gradient(circle at 50% 40%, #A3402B 0%, #7A1F2B 45%, #3E0F19 100%)" }}
                >
                  <span className="absolute inset-[5px] sm:inset-[7px] rounded-full border border-marigold/40" aria-hidden="true" />
                  <span className="font-display italic text-[11px] sm:text-[15px] text-ivory/80">Everything</span>
                  <span className="font-display text-[26px] sm:text-[40px] leading-none text-marigold-light">{money(tier)}</span>
                </span>
                <span className="mt-4 font-medium text-dark ease-out duration-200 group-hover:text-blue">All at {money(tier)}</span>
                <span className="text-custom-xs text-dark-4">{(counts[tier] ?? 0).toLocaleString("en-IN")} items</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
