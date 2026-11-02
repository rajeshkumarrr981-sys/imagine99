import React from "react";
import Link from "next/link";
import Logo from "@/components/Diwali/Logo";
import Toran from "@/components/Diwali/Toran";
import Diya from "@/components/Diwali/Diya";


const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop-with-sidebar" },
      { label: "Best sellers", href: "/shop-with-sidebar?sort=popular" },
      { label: "Everything at ₹149", href: "/shop-with-sidebar?tier=149" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My account", href: "/my-account" },
      { label: "Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
      { label: "Create an account", href: "/signup" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Sign in", href: "/signin" },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-night text-ivory/70">
      <Toran className="absolute -top-[3px] left-0 opacity-80" leaves={false} />
      <div className="absolute inset-0 bg-kolam-night opacity-40" aria-hidden="true" />

      <div className="relative max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pt-20 pb-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tone="ivory" />
            <p className="mt-5 max-w-[340px] leading-relaxed">
              Handcrafted décor, serveware and festive keepsakes, chosen for the people you celebrate with. Everything at ₹149, ₹249 or ₹399, with free shipping on every order.
            </p>
            <div className="mt-7 flex items-end gap-4" aria-hidden="true">
              <Diya size={30} delay={0.2} />
              <Diya size={38} delay={0.9} />
              <Diya size={30} delay={0.5} />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-[19px] text-ivory">{col.title}</h2>
                <ul className="mt-5 flex flex-col gap-3 text-custom-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="ease-out duration-200 hover:text-marigold-light">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-ivory/10 flex flex-col sm:flex-row gap-3 justify-between text-custom-xs text-ivory/50">
          <p>&copy; {year} Imagine99. All rights reserved.</p>
          <p className="font-display italic text-[13px] text-marigold-light/80">May your home be full of light.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
