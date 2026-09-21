import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

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

export async function getCategories() {
  const res = await apiFetch(`${BASE_URL}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = await res.json();
  const result = json.data ?? json;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.categories)) return result.categories;
  return [];
}

export async function createCategory(data: { name: string; image: string }) {
  const res = await apiFetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to create category");
}

export async function updateCategory(id: string, data: { name?: string; image?: string }) {
  const res = await apiFetch(`${BASE_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to update category");
}

export async function deleteCategory(id: string) {
  const res = await apiFetch(`${BASE_URL}/categories/${id}`, { method: "DELETE" });
  return unwrap(res, "Failed to delete category");
}

export type ProductFormPayload = {
  name: string;
  description: string;
  categoryId: string;
  material: string;
  careInstructions: string;
  gifUrl?: string;
  isAntiTarnish: boolean;
  isWaterproof: boolean;
  isSkinFriendly: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: { imageUrl: string; sortOrder: number }[];
  variants: {
    sku: string;
    color: string;
    size: string;
    price: number;
    comparePrice?: number;
    stock: number;
  }[];
};

export async function createProduct(data: ProductFormPayload) {
  const res = await apiFetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to create product");
}

export async function updateProduct(id: string, data: Partial<ProductFormPayload>) {
  const res = await apiFetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return unwrap(res, "Failed to update product");
}

export async function deleteProduct(id: string) {
  const res = await apiFetch(`${BASE_URL}/products/${id}`, { method: "DELETE" });
  return unwrap(res, "Failed to delete product");
}