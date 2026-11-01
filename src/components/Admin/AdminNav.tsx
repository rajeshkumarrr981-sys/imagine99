"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg py-2.5 px-4 font-medium ease-out duration-200 ${
              active ? "bg-blue text-white" : "text-dark hover:bg-gray-2"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
