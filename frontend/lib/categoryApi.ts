export type Category = {
    id: string;
    name: string;
    image: string;
  };
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  
  export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    const data = json.data ?? json;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.categories)) return data.categories;
    return [];
  }