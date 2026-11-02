"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Diya from "@/components/Diwali/Diya";
import Lantern from "@/components/Diwali/Lantern";
import { DIWALI_AT, DIWALI_YEAR } from "@/lib/festival";

type Left = { days: number; hours: number; minutes: number; seconds: number };

function timeLeft(): Left | null {
  const ms = Date.parse(DIWALI_AT) - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Festive banner counting down to Lakshmi Puja; turns into a greeting on the day. */
const Countdown = () => {
  // Start empty so server and browser render the same thing, then tick.
  const [left, setLeft] = useState<Left | null | undefined>(undefined);

  useEffect(() => {
    setLeft(timeLeft());
    const t = setInterval(() => setLeft(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  const units: [string, number | undefined][] = [
    ["Days", left?.days],
    ["Hours", left?.hours],
    ["Minutes", left?.minutes],
    ["Seconds", left?.seconds],
  ];

  return (
    <section className="pt-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-2xl bg-night text-ivory">
          <div className="absolute inset-0 bg-kolam-night opacity-70" aria-hidden="true" />
          <div className="absolute top-0 right-[8%] hidden md:block">
            <Lantern drop={30} size={52} variant="round" delay={0.6} />
          </div>
          <div className="absolute top-0 right-[22%] hidden lg:block">
            <Lantern drop={84} size={34} variant="kandil" delay={1.7} />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-10 px-6 py-12 sm:px-12 sm:py-16">
            <div>
              <p className="eyebrow text-marigold-light">Deepavali {DIWALI_YEAR}</p>
              {left === null ? (
                <>
                  <h2 className="mt-3 text-[34px] sm:text-[44px] leading-[1.1] text-ivory">
                    Shubh Deepavali <span className="italic text-marigold">to you and yours</span>
                  </h2>
                  <p className="mt-4 max-w-[420px] text-ivory/70">
                    May the lights bring warmth to your home. Our festive picks are still available while stock lasts.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-[34px] sm:text-[44px] leading-[1.1] text-ivory">
                    Counting down to <span className="italic text-marigold">Lakshmi Puja</span>
                  </h2>
                  <p className="mt-4 max-w-[420px] text-ivory/70">
                    Order early so your gifts arrive before the lamps are lit. Everything is ₹149, ₹249 or ₹399, shipped free.
                  </p>
                </>
              )}
              <Link
                href="/shop-with-sidebar"
                className="mt-8 inline-flex rounded-full border border-marigold/60 px-6 py-3 text-custom-sm font-medium text-marigold-light ease-out duration-200 hover:bg-marigold hover:text-night hover:border-marigold"
              >
                Find a gift
              </Link>
            </div>

            <div className="flex flex-col justify-end gap-8">
              {left !== null && (
                <dl className="grid grid-cols-4 gap-3 sm:gap-4 max-w-[440px]" aria-live="off">
                  {units.map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-brass/30 bg-night-2/60 px-2 py-4 text-center">
                      <dd className="font-display text-[34px] sm:text-[42px] leading-none text-ivory tabular-nums">
                        {value === undefined ? "--" : pad(value)}
                      </dd>
                      <dt className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ivory/50">{label}</dt>
                    </div>
                  ))}
                </dl>
              )}
              <div className="flex items-end gap-6" aria-hidden="true">
                {[0, 0.5, 1.1, 0.3, 0.8].map((d, i) => (
                  <Diya key={i} size={i === 2 ? 46 : 36} delay={d} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
