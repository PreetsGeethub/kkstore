const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function addToGuestCart(variantId: string, quantity: number) {
  const res = await fetch(`${BASE_URL}/guest-cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to add item to cart");
  }
  const data = await res.json();
  return data.data ?? data; // ApiResponse wrapper, same pattern as auth
}