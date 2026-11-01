"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Stars from "@/components/Common/Stars";

export type ReviewView = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Props = {
  productId: string;
  reviews: ReviewView[];
  signedIn: boolean;
  myReview?: { rating: number; comment: string };
};

export default function ProductReviews({ productId, reviews, signedIn, myReview }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please choose a rating");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not save review");
      return;
    }
    toast.success(myReview ? "Review updated" : "Thanks for your review!");
    router.refresh();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5 mt-10">
      <div className="max-w-[570px] w-full">
        <h2 className="font-medium text-2xl text-dark mb-6">
          {reviews.length} Review{reviews.length === 1 ? "" : "s"}
        </h2>

        {reviews.length === 0 && <p>No reviews yet. Be the first to review this product.</p>}

        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-dark">{r.userName}</h3>
                  <p className="text-custom-sm">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <Stars rating={r.rating} size={15} />
              </div>
              <p className="text-dark mt-4 whitespace-pre-line">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[550px] w-full">
        <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
          <h2 className="font-medium text-2xl text-dark mb-3.5">{myReview ? "Edit your review" : "Add a review"}</h2>

          {!signedIn ? (
            <p>
              Please{" "}
              <Link href={`/signin?callbackUrl=/shop-details/${productId}`} className="text-blue">
                sign in
              </Link>{" "}
              to write a review.
            </p>
          ) : (
            <form onSubmit={submit}>
              <div className="flex items-center gap-3 mb-5">
                <span>Your rating*</span>
                <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHover(n)}
                      onClick={() => setRating(n)}
                      className={`text-2xl leading-none ${n <= (hover || rating) ? "text-[#FBB040]" : "text-gray-4"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label htmlFor="comment" className="block mb-2.5">
                Comment*
              </label>
              <textarea
                id="comment"
                required
                maxLength={2000}
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike?"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <span className="block text-custom-sm text-right">{comment.length}/2000</span>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark mt-4 disabled:opacity-60"
              >
                {saving ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
