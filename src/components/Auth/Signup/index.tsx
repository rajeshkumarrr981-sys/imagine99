"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import GoogleIcon from "@/components/Auth/GoogleIcon";
import { inputClass } from "@/components/Auth/styles";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signup = ({ googleEnabled }: { googleEnabled: boolean }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (password !== form.get("re-type-password")) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create account.");
      setLoading(false);
      return;
    }

    // Sign the new user in straight away.
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/my-account");
    router.refresh();
  }

  return (
    <>
      <Breadcrumb title={"Create an account"} pages={["Sign up"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            {googleEnabled && (
              <>
                <div className="flex flex-col gap-4.5">
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/my-account" })}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    <GoogleIcon />
                    Sign Up with Google
                  </button>
                </div>
                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>
              </>
            )}

            <form onSubmit={handleSubmit} className="mt-5.5">
              {error && (
                <p role="alert" className="mb-5 rounded-lg bg-red-light-6 text-red px-4 py-3 text-custom-sm">
                  {error}
                </p>
              )}

              <div className="mb-5">
                <label htmlFor="name" className="block mb-2.5">
                  Full Name <span className="text-red">*</span>
                </label>
                <input id="name" type="text" name="name" required minLength={2} placeholder="Enter your full name" autoComplete="name" className={inputClass} />
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address <span className="text-red">*</span>
                </label>
                <input id="email" type="email" name="email" required placeholder="Enter your email address" autoComplete="email" className={inputClass} />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password <span className="text-red">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div className="mb-5.5">
                <label htmlFor="re-type-password" className="block mb-2.5">
                  Re-type Password <span className="text-red">*</span>
                </label>
                <input
                  id="re-type-password"
                  type="password"
                  name="re-type-password"
                  required
                  placeholder="Re-type your password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-center mt-6">
                Already have an account?
                <Link href="/signin" className="text-dark ease-out duration-200 hover:text-blue pl-2">
                  Sign in Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
