"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import GoogleIcon from "@/components/Auth/GoogleIcon";
import { inputClass } from "@/components/Auth/styles";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = { googleEnabled: boolean; callbackUrl: string; error?: string };

const Signin = ({ googleEnabled, callbackUrl, error: initialError }: Props) => {
  const router = useRouter();
  const [error, setError] = useState(initialError ? "Sign in failed. Please try again." : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Wrong email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <>
      <Breadcrumb title={"Welcome back"} pages={["Sign in"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <p role="alert" className="mb-5 rounded-lg bg-red-light-6 text-red px-4 py-3 text-custom-sm">
                  {error}
                </p>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input id="email" type="email" name="email" required placeholder="Enter your email" autoComplete="email" className={inputClass} />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to account"}
              </button>

              {googleEnabled && (
                <>
                  <span className="relative z-1 block font-medium text-center mt-4.5">
                    <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                    <span className="inline-block px-3 bg-white">Or</span>
                  </span>

                  <div className="flex flex-col gap-4.5 mt-4.5">
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl })}
                      className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                    >
                      <GoogleIcon />
                      Sign In with Google
                    </button>
                  </div>
                </>
              )}

              <p className="text-center mt-6">
                Don&apos;t have an account?
                <Link href="/signup" className="text-dark ease-out duration-200 hover:text-blue pl-2">
                  Sign Up Now!
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
