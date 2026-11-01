import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin, currentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const ADMIN_SIGNIN_URL = "/signin?callbackUrl=/admin";

/**
 * Returns the admin user if the session belongs to an admin whose role is still
 * "admin" in the database, or null otherwise. The role in the JWT is only
 * refreshed on sign-in, so the DB check makes demotions take effect at once.
 */
export async function getVerifiedAdmin() {
  const admin = await currentAdmin();
  if (!admin) return null;
  await connectDB();
  const stillAdmin = await User.exists({ _id: admin.id, role: "admin" });
  return stillAdmin ? admin : null;
}

/**
 * Page/layout guard: redirects signed-out visitors to sign-in, returns null for
 * signed-in non-admins (render <Forbidden /> then), else the admin user.
 */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect(ADMIN_SIGNIN_URL);
  return getVerifiedAdmin();
}

export function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-[480px] w-full rounded-xl bg-white shadow-1 p-7.5 text-center">
        <p className="text-custom-sm font-medium text-red mb-2">403</p>
        <h1 className="font-semibold text-xl text-dark mb-3">Admins only</h1>
        <p className="mb-6">Your account doesn&apos;t have access to the admin panel.</p>
        <Link
          href="/"
          className="inline-flex font-medium text-white bg-dark py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
