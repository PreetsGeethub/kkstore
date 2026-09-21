import { apiFetch } from "./apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiFetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    // NOTE: no Content-Type header here — the browser sets the correct
    // multipart/form-data boundary automatically when body is FormData.
    // Setting it manually breaks the upload.
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to upload image");
  }

  const json = await res.json();
  const data = json.data ?? json;
  return data.imageUrl;
}