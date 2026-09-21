import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getAllOrders(params?: {
  search?: string;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  query.set("status", params?.status ?? "all");
  query.set("sortBy", params?.sortBy ?? "createdAt");
  query.set("order", params?.order ?? "desc");
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 20));

  const res = await apiFetch(`${BASE_URL}/admin/orders?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const json = await res.json();
  const data = json.data ?? json;
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    pagination: data.pagination ?? null,
  };
}

export async function getAdminOrderById(orderId: string) {
  const res = await apiFetch(`${BASE_URL}/admin/orders/${orderId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch order");
  const json = await res.json();
  return json.data ?? json;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await apiFetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update status");
  }
  const json = await res.json();
  return json.data ?? json;
}