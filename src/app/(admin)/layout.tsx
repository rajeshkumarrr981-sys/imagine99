import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import { display } from "../fonts";
import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/Admin/AdminNav";
import Logo from "@/components/Diwali/Logo";
import SignOutButton from "@/components/Admin/SignOutButton";
import { Forbidden, requireAdmin } from "@/components/Admin/guard";

export const metadata: Metadata = {
  title: { default: "Admin | Imagine99", template: "%s | Imagine99 Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Redirects signed-out visitors to /signin; null means signed in but not an admin.
  // Pages and server actions re-check this, since layouts don't re-run on every navigation.
  const admin = await requireAdmin();

  return (
    <html lang="en" className={display.variable}>
      <body className="bg-gray-2 min-h-screen text-body">
        {!admin ? (
          <Forbidden />
        ) : (
          <div className="flex flex-col lg:flex-row min-h-screen">
            <aside className="lg:w-[250px] lg:shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-3 lg:sticky lg:top-0 lg:h-screen flex flex-col">
              <div className="px-5 py-4 lg:py-6 flex items-center justify-between lg:block">
                <Link href="/admin" className="inline-flex items-baseline gap-2">
                  <Logo href={null} />
                  <span className="eyebrow">Admin</span>
                </Link>
              </div>
              <div className="px-3 pb-3 lg:pb-0 lg:flex-1">
                <AdminNav />
              </div>
              <div className="hidden lg:flex flex-col gap-1 px-3 py-5 border-t border-gray-3">
                <Link
                  href="/"
                  className="rounded-lg py-2.5 px-4 font-medium text-dark ease-out duration-200 hover:bg-gray-2"
                >
                  View store ↗
                </Link>
                <SignOutButton className="text-left rounded-lg py-2.5 px-4 font-medium text-red ease-out duration-200 hover:bg-red-light-6 disabled:opacity-60" />
              </div>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col">
              <header className="bg-white border-b border-gray-3 px-4 sm:px-7.5 py-3.5 flex items-center justify-end gap-4">
                <span className="text-custom-sm text-dark-4 truncate">
                  Signed in as <span className="font-medium text-dark">{admin.name ?? admin.email}</span>
                </span>
                <Link href="/" className="lg:hidden text-custom-sm font-medium text-dark hover:text-blue">
                  View store
                </Link>
                <SignOutButton className="lg:hidden text-custom-sm font-medium text-red hover:text-red-dark disabled:opacity-60" />
              </header>
              <main className="flex-1 px-4 sm:px-7.5 py-7.5">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
