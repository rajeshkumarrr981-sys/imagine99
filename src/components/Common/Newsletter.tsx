"use client";
import React, { useState } from "react";
import Diya from "@/components/Diwali/Diya";

/** Newsletter sign-up. Saves the email to the database. */
const Newsletter = () => {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setStatus("saving");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("done");
      setMessage("Thank you. We'll write when something worth sharing arrives.");
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="pt-24 pb-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-gray-3 bg-marigold-wash bg-kolam px-6 py-12 sm:px-12 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex items-start gap-5">
              <Diya size={52} className="shrink-0 hidden sm:block" />
              <div>
                <h2 className="text-[28px] sm:text-[34px] leading-[1.15] text-dark">Letters from Imagine99</h2>
                <p className="mt-2 text-dark-4 max-w-[440px]">New arrivals and festive offers, a few times a season. No noise.</p>
              </div>
            </div>

            {status === "done" ? (
              <p className="text-dark font-medium" role="status">
                {message}
              </p>
            ) : (
              <form onSubmit={submit} className="w-full">
                <div className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    required
                    placeholder="Your email address"
                    className="flex-1 rounded-full border border-gray-4 bg-white py-3.5 px-6 text-dark placeholder:text-dark-4 outline-none focus:border-brass"
                  />
                  <button
                    type="submit"
                    disabled={status === "saving"}
                    className="rounded-full bg-blue px-7 py-3.5 font-medium text-white ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                  >
                    {status === "saving" ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="mt-3 text-custom-sm text-red" role="alert">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
