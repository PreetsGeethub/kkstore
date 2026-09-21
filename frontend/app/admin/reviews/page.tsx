"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Trash2, Search, BadgeCheck } from "lucide-react";
import { getAllReviews, deleteAdminReview } from "@/lib/adminReviewApi";
import { useToast } from "@/components/Toast";

const RATING_OPTIONS = ["all", "5", "4", "3", "2", "1"];

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllReviews({ search, rating: ratingFilter })
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [ratingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This can't be undone.")) return;

    setDeletingId(id);
    try {
      await deleteAdminReview(id);
      showToast({ variant: "info", title: "Review deleted" });
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to delete review",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Reviews</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search by product, title, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-[#E8D8C5] bg-white px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 border border-[#2A1E17] px-4 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-white"
          >
            <Search size={14} strokeWidth={1.5} />
          </button>
        </form>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border border-[#E8D8C5] bg-white px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
        >
          {RATING_OPTIONS.map((r) => (
            <option key={r} value={r}>{r === "all" ? "All Ratings" : `${r} Stars`}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      ) : reviews.length === 0 ? (
        <p className="font-sans text-sm text-[#4A4A4A]">No reviews found.</p>
      ) : (
        <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5] bg-white">
          {reviews.map((review) => (
            <div key={review.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          strokeWidth={1.5}
                          className={i < review.rating ? "fill-[#B08D57] text-[#B08D57]" : "text-[#E8D8C5]"}
                        />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <BadgeCheck size={13} strokeWidth={1.5} className="text-[#7A9B76]" />
                    )}
                  </div>
                  <p className="mt-1 font-sans text-sm font-medium text-[#2A1E17]">{review.title}</p>
                  <p className="mt-0.5 font-sans text-sm text-[#4A4A4A]">{review.comment}</p>
                  <p className="mt-2 font-sans text-xs text-[#4A4A4A]">
                    {review.user?.firstName} {review.user?.lastName} · {review.product?.name} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  aria-label="Delete review"
                  className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F] disabled:opacity-50"
                >
                  {deletingId === review.id ? (
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}