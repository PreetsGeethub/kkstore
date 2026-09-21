import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getProductReviews(productId: string) {
  const res = await fetch(`${BASE_URL}/reviews/product/${productId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const json = await res.json();
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function createReview(data: { productId: string; rating: number; title: string; comment: string }) {
  const res = await apiFetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to submit review");
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function deleteReview(reviewId: string) {
  const res = await apiFetch(`${BASE_URL}/reviews/${reviewId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete review");
  return res.json();
}