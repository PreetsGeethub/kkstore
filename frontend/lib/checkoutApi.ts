import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function createAddress(address) {
  const res = await apiFetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (err?.errors?.length > 0) {
      throw new Error(err.errors.map((e) => e.message).join(" - "));
    }
    throw new Error(err?.message ?? "Failed to save address");
  }
  const data = await res.json();
  return data.id ?? data.address?.id ?? data.data?.id;
}

export async function addToServerCart(variantId, quantity) {
  const res = await apiFetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to sync cart item");
  return res.json();
}

export async function getOrder(orderId) {
  const res = await apiFetch(`${BASE_URL}/orders/${orderId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch order");
  const json = await res.json();
  return json.data ?? json;
}

export async function createOrder(params) {
  const res = await apiFetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to create order");
  }
  const data = await res.json();
  return data.data?.id ?? data.id;
}

export async function createPayment(orderId) {
  const res = await apiFetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to create payment");
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function validateCoupon(code, subtotal) {
  const res = await apiFetch(`${BASE_URL}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal: String(subtotal) }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message ?? "Invalid coupon code");
  }
  return res.json();
}

export async function verifyPayment(data) {
  const res = await apiFetch(`${BASE_URL}/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Payment verification failed");
  }
  const json = await res.json();
  return json.data ?? json;
}
