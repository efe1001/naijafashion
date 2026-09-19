"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, BadgeCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Review {
  id: string;
  userId: string | null;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  canReview: boolean;
  hasReviewed: boolean;
  isLoggedIn: boolean;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
    if (res.ok) setData(await res.json());
  }, [productId]);

  useEffect(() => {
    load();
  }, [load, currentUser?.id]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not submit review");
      setComment("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    load();
  };

  const reviews = data?.reviews ?? [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-14 pt-10 border-t border-gray-100">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <Stars value={average} size={16} />
              <span className="font-semibold text-gray-800">{average.toFixed(1)}</span>
              <span className="text-sm text-gray-400">
                ({reviews.length} review{reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">No reviews yet.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">{r.userName}</p>
                    <span className="flex items-center gap-1 text-xs text-green-700">
                      <BadgeCheck size={12} /> Verified purchase
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars value={r.rating} />
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {(currentUser?.role === "admin" || currentUser?.id === r.userId) && (
                  <button onClick={() => remove(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete review">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 h-fit">
          <h3 className="font-bold text-gray-900 mb-3">Write a review</h3>
          {!data?.isLoggedIn && (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-green-700 font-semibold hover:underline">Log in</Link> to review products you have bought.
            </p>
          )}
          {data?.isLoggedIn && data.hasReviewed && <p className="text-sm text-gray-500">Thanks, you have already reviewed this product.</p>}
          {data?.isLoggedIn && !data.hasReviewed && !data.canReview && (
            <p className="text-sm text-gray-500">Only customers who have bought this product can review it.</p>
          )}
          {data?.canReview && (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} aria-label={`${s} stars`}>
                    <Star size={24} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others what you think (optional)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 text-sm disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
