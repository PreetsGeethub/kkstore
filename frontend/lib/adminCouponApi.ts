import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export type CouponPayload = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  startsAt: string;
  expiresAt: string;
  isActive?: boolean;
};

async function unwrap(res: Response, errorMsg: string) {
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (err?.errors?.length > 0) {
      throw new Error(err.errors.map((e: { message: string }) => e.message).join(" · "));
    }
    throw new Error(err?.message ?? errorMsg);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function getCoupons(params?: { search?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  query.set("status", params?.status ?? "all");
  query.set("page", "1");
  query.set("limit", "50");

  const res = await apiFetch(`${BASE_URL}/admin/coupons?${query.toString()}`, { cache: "no-store" });
  const data = await unwrap(res, "Failed to fetch coupons");
  return {
    coupons: Array.isArray(data.coupons) ? data.coupons : [],
    pagination: data.pagination ?? null,
  };
}

export async function createCoupon(data: CouponPayload) {
  const res = await apiFetch(`${BASE_URL}/admin/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to create coupon");
}

export async function updateCoupon(id: string, data: Partial<CouponPayload>) {
  const res = await apiFetch(`${BASE_URL}/admin/coupons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to update coupon");
}

export async function deleteCoupon(id: string) {
  const res = await apiFetch(`${BASE_URL}/admin/coupons/${id}`, { method: "DELETE" });
  return unwrap(res, "Failed to deactivate coupon");
}