import Link from "next/link";
import { getProducts } from "@/lib/productApi";
import { getCategories } from "@/lib/adminApi"; // already exists and works
import { listItemToCardProduct } from "@/lib/adapters";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;

  const sortMap: Record<string, { sortBy: string; order: "asc" | "desc" }> = {
    newest: { sortBy: "createdAt", order: "desc" },
    bestselling: { sortBy: "createdAt", order: "desc" }, // no real bestseller sort field yet — see note
  };

  const [{ products: apiProducts }, categories] = await Promise.all([
    getProducts({
      categoryId: category,
      sortBy: sort ? sortMap[sort]?.sortBy : undefined,
      order: sort ? sortMap[sort]?.order : undefined,
    }),
    getCategories().catch(() => []),
  ]);

  const activeCategory = categories.find((c: any) => c.id === category);
  const products = apiProducts.map(listItemToCardProduct);

  return (
    <main className="bg-[#FAF7F2] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              {activeCategory ? activeCategory.name : "Shop All"}
            </span>
          </div>
          <h1 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
            {activeCategory ? activeCategory.name : "All Products"}
          </h1>
          <p className="mt-2 font-sans text-sm text-[#4A4A4A]">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
              <Link
                href="/products"
                className={`font-sans text-sm transition-colors duration-200 ${
                  !category ? "font-medium text-[#B08D57]" : "text-[#4A4A4A] hover:text-[#2A1E17]"
                }`}
              >
                All Products
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className={`font-sans text-sm transition-colors duration-200 ${
                    category === cat.id ? "font-medium text-[#B08D57]" : "text-[#4A4A4A] hover:text-[#2A1E17]"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </aside>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-[var(--font-playfair)] text-xl text-[#2A1E17]">No products found</p>
                <p className="mt-2 font-sans text-sm text-[#4A4A4A]">Try a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}