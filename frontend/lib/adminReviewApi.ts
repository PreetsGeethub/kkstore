import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getAllReviews(params?: { search?: string; rating?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  query.set("rating", params?.rating ?? "all");
  query.set("page", "1");
  query.set("limit", "50");

  const res = await apiFetch(`${BASE_URL}/admin/reviews?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const json = await res.json();
  const data = json.data ?? json;
  return {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    pagination: data.pagination ?? null,
  };
}

export async function deleteAdminReview(reviewId: string) {
  const res = await apiFetch(`${BASE_URL}/admin/reviews/${reviewId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to delete review");
  }
  const json = await res.json();
  return json.data ?? json;
}