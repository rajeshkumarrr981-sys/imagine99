import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  // JWT sessions are required for the credentials provider.
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: String(user._id), name: user.name, email: user.email, image: user.image };
      },
    }),
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      // Google must have verified the address before we link it to an account.
      if (!user.email || (profile as { email_verified?: boolean })?.email_verified === false) return false;

      await connectDB();
      await User.updateOne(
        { email: user.email.toLowerCase() },
        {
          $setOnInsert: { email: user.email.toLowerCase(), name: user.name ?? user.email, role: "user" },
          $set: { image: user.image },
        },
        { upsert: true }
      );
      return true;
    },
    async jwt({ token }) {
      // Re-read the user on every request so a deleted account or a changed role
      // takes effect straight away instead of when the session expires.
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() }).select("name role").lean();
        if (dbUser) {
          token.uid = String(dbUser._id);
          token.role = dbUser.role;
          token.name = dbUser.name;
        } else {
          delete token.uid;
          delete token.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
};

export const isGoogleEnabled = googleEnabled;

export function getSession() {
  return getServerSession(authOptions);
}

/** Returns the signed-in user, or null. Use in route handlers. */
export async function currentUser() {
  const session = await getSession();
  return session?.user?.id ? session.user : null;
}

export async function currentAdmin() {
  const user = await currentUser();
  return user?.role === "admin" ? user : null;
}
