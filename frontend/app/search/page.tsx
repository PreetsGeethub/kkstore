import Link from "next/link";
import { getProducts } from "@/lib/productApi";
import { listItemToCardProduct } from "@/lib/adapters";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const { products: apiProducts } = query
    ? await getProducts({ search: query, limit: 40 }).catch(() => ({ products: [] }))
    : { products: [] };

  const products = apiProducts.map(listItemToCardProduct);

  return (
    <main className="bg-[#FAF7F2] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              Search Results
            </span>
          </div>
          <h1 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
            {query ? `"${query}"` : "Search"}
          </h1>
          <p className="mt-2 font-sans text-sm text-[#4A4A4A]">
            {query
              ? `${products.length} ${products.length === 1 ? "result" : "results"}`
              : "Enter a search term to find products."}
          </p>
        </div>

        {query && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-[var(--font-playfair)] text-xl text-[#2A1E17]">
              No results for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-2 max-w-sm font-sans text-sm text-[#4A4A4A]">
              Try a different search term, or browse our full collection instead.
            </p>
            <Link
              href="/products"
              className="mt-6 bg-[#B08D57] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
            >
              Shop All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}