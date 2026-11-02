"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Logo from "@/components/Diwali/Logo";
import Toran from "@/components/Diwali/Toran";
import { money } from "@/lib/pricing";

const nav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop-with-sidebar" },
  { label: "Best sellers", href: "/shop-with-sidebar?sort=popular" },
  { label: "Contact", href: "/contact" },
];

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCartModal } = useCartModalContext();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const cartItems = useAppSelector((s) => s.cartReducer.items);
  const wishlistCount = useAppSelector((s) => s.wishlistReducer.items.length);
  const totalPrice = useSelector(selectTotalPrice);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  // A session whose account no longer exists has no id; treat it as signed out.
  const signedIn = !!session?.user?.id;
  const accountHref = signedIn ? (session!.user.role === "admin" ? "/admin" : "/my-account") : "/signin";
  const accountLabel = signedIn ? session!.user.name?.split(" ")[0] || "Account" : "Sign in";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/shop-with-sidebar?search=${encodeURIComponent(q)}` : "/shop-with-sidebar");
  };

  // Links with a query string (like best sellers) are shortcuts and are never marked active.
  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("?") && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-9999">
      {/* announcement bar */}
      <div className="relative bg-night text-ivory/85">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0 h-9 flex items-center justify-center sm:justify-between text-custom-xs tracking-wide">
          <p className="hidden sm:block">
            <span className="font-display italic text-marigold-light text-[13px] mr-2">Shubh Deepavali</span>
            from all of us at Imagine99
          </p>
          <p>
            Everything at ₹149 · ₹249 · ₹399 <span className="mx-2 text-brass">·</span> Free shipping
          </p>
        </div>
      </div>

      <div className={`relative bg-ivory/95 backdrop-blur-sm ease-out duration-300 ${scrolled ? "shadow-2" : ""}`}>
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className={`flex items-center gap-6 xl:gap-10 ease-out duration-300 ${scrolled ? "h-16" : "h-20"}`}>
            <Logo />

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative text-custom-sm font-medium ease-out duration-200 hover:text-blue after:absolute after:left-0 after:-bottom-1.5 after:h-px after:bg-blue after:ease-out after:duration-300 ${
                        isActive(item.href) ? "text-blue after:w-full" : "text-dark after:w-0 hover:after:w-full"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <form onSubmit={handleSearch} role="search" className="hidden md:block flex-1 max-w-[340px] ml-auto">
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <input
                  id="site-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search décor, serveware, gifts…"
                  autoComplete="off"
                  className="custom-search w-full rounded-full bg-white border border-gray-3 py-2.5 pl-5 pr-11 text-custom-sm text-dark placeholder:text-dark-4 outline-none ease-out duration-200 focus:border-brass"
                />
                <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-dark-3 hover:text-blue">
                  <svg {...iconProps} width={18} height={18}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
              <Link href={accountHref} className="flex items-center gap-2 rounded-full px-2.5 py-2 text-dark hover:text-blue ease-out duration-200" aria-label={signedIn ? "My account" : "Sign in"}>
                <svg {...iconProps}>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c1.2-3.6 3.9-5.5 7-5.5s5.8 1.9 7 5.5" />
                </svg>
                <span className="hidden xl:block text-custom-sm font-medium">{accountLabel}</span>
              </Link>

              <Link href="/wishlist" className="relative rounded-full p-2 text-dark hover:text-blue ease-out duration-200" aria-label={`Wishlist, ${wishlistCount} items`}>
                <svg {...iconProps}>
                  <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue text-white text-[10px] leading-[17px] text-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={openCartModal} className="flex items-center gap-2 rounded-full p-2 text-dark hover:text-blue ease-out duration-200" aria-label={`Cart, ${cartCount} items`}>
                <span className="relative">
                  <svg {...iconProps}>
                    <path d="M5 8h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
                    <path d="M9 8V7a3 3 0 0 1 6 0v1" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-marigold text-dark text-[10px] font-medium leading-[17px] text-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden xl:block text-custom-sm font-medium">{money(totalPrice)}</span>
              </button>

              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="lg:hidden rounded-full p-2 text-dark"
                aria-label="Menu"
                aria-expanded={menuOpen}
              >
                <svg {...iconProps}>
                  {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-3 bg-ivory">
            <div className="px-4 sm:px-7.5 py-5 flex flex-col gap-5">
              <form onSubmit={handleSearch} role="search" className="md:hidden">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search décor, serveware, gifts…"
                  aria-label="Search products"
                  className="w-full rounded-full bg-white border border-gray-3 py-2.5 px-5 text-custom-sm outline-none focus:border-brass"
                />
              </form>
              <ul className="flex flex-col">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={`block py-3 border-b border-gray-3 font-display text-xl ${isActive(item.href) ? "text-blue" : "text-dark"}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* garland hanging just below the header, fades out once the page scrolls */}
        <Toran className={`absolute left-0 top-full -mt-1 pointer-events-none ease-out duration-500 ${scrolled || menuOpen ? "opacity-0" : "opacity-95"}`} />
      </div>
    </header>
  );
};

export default Header;
