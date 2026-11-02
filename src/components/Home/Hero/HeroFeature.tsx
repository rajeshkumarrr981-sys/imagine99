import React from "react";
import { COD_MIN_ORDER, money } from "@/lib/pricing";

const stroke = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const features = [
  {
    title: "Free shipping",
    text: "On every order, anywhere we deliver",
    icon: (
      <svg {...stroke}>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.6" />
        <circle cx="17" cy="17.5" r="1.6" />
      </svg>
    ),
  },
  {
    title: "Pay by UPI",
    text: `Cash on delivery on orders of ${money(COD_MIN_ORDER)}+`,
    icon: (
      <svg {...stroke}>
        <rect x="3" y="6.5" width="18" height="11" rx="1.5" />
        <circle cx="12" cy="12" r="2.4" />
        <path d="M6.5 9.5v5M17.5 9.5v5" />
      </svg>
    ),
  },
  {
    title: "Track every order",
    text: "Status updates in your account",
    icon: (
      <svg {...stroke}>
        <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
        <circle cx="12" cy="10" r="2.3" />
      </svg>
    ),
  },
];

const HeroFeature = () => {
  return (
    <div className="border-b border-gray-3 bg-ivory">
      <ul className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-3">
        {features.map((f) => (
          <li key={f.title} className="flex items-center gap-4 py-6 sm:px-8 first:sm:pl-0">
            <span className="text-brass-dark">{f.icon}</span>
            <span>
              <span className="block font-medium text-dark">{f.title}</span>
              <span className="block text-custom-sm text-dark-4">{f.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroFeature;
