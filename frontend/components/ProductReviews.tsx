"use client";

import { useState } from "react";
import { Star, BadgeCheck, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "./Auth";
import { useToast } from "./Toast";
import { createReview, deleteReview } from "@/lib/reviewApi";

type Review = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string };
};

type ProductReviewsProps = {
  productId: string;
  initialReviews: Review[];
};

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast({ variant: "error", title: "Select a star rating" });
      return;
    }
    if (!title.trim() || !comment.trim()) {
      showToast({ variant: "error", title: "Fill in a title and comment" });
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await createReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setReviews((prev) => [
        {
          ...newReview,
          user: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" },
        },
        ...prev,
      ]);

      showToast({ variant: "success", title: "Review submitted" });
      setShowForm(false);
      setRating(0);
      setTitle("");
      setComment("");
    } catch (error) {
      showToast({
        variant: "error",
        title: "Couldn't submit review",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast({ variant: "info", title: "Review deleted" });
    } catch {
      showToast({ variant: "error", title: "Failed to delete review" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-16 border-t border-[#E8D8C5] pt-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    strokeWidth={1.5}
                    className={i < Math.round(avgRating) ? "fill-[#B08D57] text-[#B08D57]" : "text-[#E8D8C5]"}
                  />
                ))}
              </div>
              <span className="font-sans text-xs text-[#4A4A4A]">
                {avgRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="border border-[#2A1E17] px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#2A1E17] hover:text-white"
          >
            Write a Review
          </button>
        )}
      </div>

      {!user && (
        <p className="mb-8 font-sans text-xs text-[#4A4A4A]">
          <a href="/login" className="text-[#B08D57] hover:underline">Log in</a> to write a review.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 border border-[#E8D8C5] bg-white p-6">
          <p className="mb-4 font-sans text-xs text-[#4A4A4A]">
            Note: you can only review products you&apos;ve purchased and received.
          </p>

          <div className="mb-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${starValue} stars`}
                >
                  <Star
                    size={24}
                    strokeWidth={1.5}
                    className={
                      starValue <= (hoverRating || rating)
                        ? "fill-[#B08D57] text-[#B08D57]"
                        : "text-[#E8D8C5]"
                    }
                  />
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Review title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3 w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
          />

          <textarea
            placeholder="Tell us what you think..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mb-4 w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#B08D57] px-6 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#C9A96E] disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 font-sans text-[11px] uppercase tracking-[0.15em] text-[#4A4A4A] hover:text-[#2A1E17]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="font-sans text-sm text-[#4A4A4A]">
          No reviews yet — be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-[#E8D8C5] pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B08D57]/15 font-sans text-[11px] font-semibold text-[#B08D57]">
                    {initials(review.user.firstName, review.user.lastName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-sans text-xs font-medium text-[#2A1E17]">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      {review.isVerifiedPurchase && (
                        <BadgeCheck size={13} strokeWidth={1.5} className="text-[#7A9B76]" />
                      )}
                    </div>
                    <p className="font-sans text-[11px] text-[#4A4A4A]">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {user && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    aria-label="Delete review"
                    className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F] disabled:opacity-50"
                  >
                    {deletingId === review.id ? (
                      <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} strokeWidth={1.5} />
                    )}
                  </button>
                )}
              </div>

              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    strokeWidth={1.5}
                    className={i < review.rating ? "fill-[#B08D57] text-[#B08D57]" : "text-[#E8D8C5]"}
                  />
                ))}
              </div>

              <p className="mt-2 font-sans text-sm font-medium text-[#2A1E17]">{review.title}</p>
              <p className="mt-1 font-sans text-sm leading-6 text-[#4A4A4A]">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}