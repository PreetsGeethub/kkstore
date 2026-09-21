import { apiFetch } from "./apiFetch";
import type { Address } from "./addressTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getAddresses(): Promise<Address[]> {
  const res = await apiFetch(`${BASE_URL}/addresses`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch addresses");
  const json = await res.json();
  const result = json.data ?? json;
  return Array.isArray(result) ? result : [];
}

export async function createAddress(address: Omit<Address, "id">): Promise<Address> {
  const res = await apiFetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });
  if (!res.ok) throw new Error("Failed to save address");
  return res.json();
}

export async function updateAddress(id: string, updates: Partial<Omit<Address, "id">>): Promise<Address> {
  const res = await apiFetch(`${BASE_URL}/addresses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update address");
  return res.json();
}

export async function deleteAddress(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/addresses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete address");
}