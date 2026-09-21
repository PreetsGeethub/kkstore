import type { ProductListItem, ApiProduct } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getProducts(params?: {
  categoryId?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  status?: "active" | "all";
}) {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.order) query.set("order", params.order);
  if (params?.status) query.set("status", params.status);
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 20));

  const res = await fetch(`${BASE_URL}/products?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  const data = json.data ?? json;
  return {
    products: Array.isArray(data.products) ? data.products : [],
    pagination: data.pagination ?? null,
  };
}

export async function getProductById(id: string): Promise<ApiProduct | null> {
  const res = await fetch(`${BASE_URL}/products/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  const json = await res.json();
  return json.data ?? json;
}