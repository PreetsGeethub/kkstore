import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getOrders() {
  const res = await apiFetch(`${BASE_URL}/orders`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const json = await res.json();
  const result = json.data ?? json;
  return Array.isArray(result) ? result : [];
}

export async function cancelOrder(orderId: string) {
  const res = await apiFetch(`${BASE_URL}/orders/${orderId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to cancel order");
  }
  const json = await res.json();
  return json.data ?? json;
}