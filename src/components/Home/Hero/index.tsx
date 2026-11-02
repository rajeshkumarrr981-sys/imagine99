import React from "react";
import Image from "next/image";
import Link from "next/link";
import Lantern from "@/components/Diwali/Lantern";
import Diya from "@/components/Diwali/Diya";
import HeroFeature from "./HeroFeature";
import { Product } from "@/types/product";
import { money } from "@/lib/pricing";

// Lanterns hang from the top edge at different heights. Sizes are in px.
const lanterns = [
  { pos: "left-[3%]", drop: 18, size: 40, variant: "round" as const, delay: 0.8, cls: "hidden sm:flex" },
  { pos: "left-[47%]", drop: 70, size: 30, variant: "kandil" as const, delay: 2.1, cls: "hidden lg:flex" },
  { pos: "right-[30%]", drop: 26, size: 46, variant: "round" as const, delay: 1.4, cls: "hidden md:flex" },
  { pos: "right-[15%]", drop: 104, size: 38, variant: "kandil" as const, delay: 0.3, cls: "hidden lg:flex" },
  { pos: "right-[4%]", drop: 40, size: 58, variant: "kandil" as const, delay: 1.9, cls: "flex" },
];

const Hero = ({ featured }: { featured?: Product }) => {
  const discount =
    featured && featured.price > featured.discountedPrice
      ? Math.round((1 - featured.discountedPrice / featured.price) * 100)
      : 0;

  return (
    <>
      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="absolute inset-0 bg-kolam-night opacity-60" aria-hidden="true" />
        {/* warm light pooling behind the product */}
        <div
          aria-hidden="true"
          className="absolute -right-40 top-10 w-[720px] h-[720px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(225,162,58,0.35) 0%, rgba(138,36,50,0.18) 40%, transparent 70%)" }}
        />

        {lanterns.map((l, i) => (
          <div key={i} className={`absolute top-0 z-1 ${l.pos} ${l.cls}`}>
            <Lantern drop={l.drop} size={l.size} variant={l.variant} delay={l.delay} tone="night" />
          </div>
        ))}

        <div className="relative max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative z-2">
              <p className="inline-flex items-center gap-3 text-custom-xs uppercase tracking-[0.24em] text-marigold-light">
                <span className="h-px w-8 bg-marigold/60" />
                The Diwali Edit
              </p>
              <h1 className="mt-6 text-[42px] leading-[1.05] sm:text-[56px] xl:text-[64px] font-normal text-ivory">
                Gifts that <em className="text-marigold italic">glow</em> long after the diyas are lit.
              </h1>
              <p className="mt-6 max-w-[460px] text-[17px] leading-[1.7] text-ivory/70">
                Handcrafted décor, serveware and festive keepsakes for the festival of lights. Chosen with care, delivered to your door, and paid for when it arrives.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-3.5 font-medium text-night ease-out duration-200 hover:bg-marigold-light"
                >
                  Shop the Diwali edit
                </Link>
                <Link
                  href="/shop-with-sidebar?sort=popular"
                  className="text-ivory/85 font-medium border-b border-ivory/30 pb-0.5 hover:text-marigold-light hover:border-marigold-light ease-out duration-200"
                >
                  See best sellers
                </Link>
              </div>
            </div>

            {featured && (
              <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
                <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
                  {/* brass thali */}
                  <div className="absolute inset-0 rounded-full border border-brass/40" />
                  <div className="absolute inset-3 rounded-full border border-dashed border-brass/30" />
                  <div
                    className="absolute inset-8 rounded-full"
                    style={{ background: "radial-gradient(circle at 50% 40%, #FBF3E2 0%, #EBD7B4 60%, #C9A46A 100%)" }}
                  />
                  <Link
                    href={`/shop-details/${featured.id}`}
                    className="absolute inset-10 rounded-full overflow-hidden ring-4 ring-brass/40"
                    aria-label={featured.title}
                  >
                    {featured.imgs.previews[0] && (
                      <Image
                        src={featured.imgs.previews[0]}
                        alt={featured.title}
                        fill
                        priority
                        sizes="400px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  {/* diyas resting at the foot of the thali */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-5">
                    <Diya size={38} delay={0.4} />
                    <Diya size={50} delay={0} />
                    <Diya size={38} delay={0.9} />
                  </div>

                  {/* product tag */}
                  <Link
                    href={`/shop-details/${featured.id}`}
                    className="group absolute -left-4 sm:-left-16 top-8 sm:top-12 max-w-[210px] rounded-xl bg-ivory text-dark px-4 py-3.5 shadow-3 ease-out duration-200 hover:-translate-y-0.5"
                  >
                    <span className="eyebrow text-[10px]">Featured gift</span>
                    <span className="mt-1 block font-display text-[17px] leading-snug line-clamp-2">{featured.title}</span>
                    <span className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-medium text-blue">{money(featured.discountedPrice)}</span>
                      {discount > 0 && <span className="text-custom-xs text-dark-4 line-through">{money(featured.price)}</span>}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative h-px bg-gradient-to-r from-transparent via-brass/50 to-transparent" />
      </section>

      <HeroFeature />
    </>
  );
};

export default Hero;
