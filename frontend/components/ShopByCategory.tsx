import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CategoryCard from "./CategoryCard";
import { getCategories } from "@/lib/categoryApi";

export default async function ShopByCategory() {
  const categories = await getCategories().catch(() => []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#B08D57]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
                Explore
              </span>
            </div>
            <h2 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
              Shop by Category
            </h2>
          </div>

          <Link
            href="/products"
            className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-[#2A1E17]"
          >
            View All
            <ArrowUpRight
              size={14}
              strokeWidth={1.5}
              className="text-[#B08D57] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              href={`/products?category=${category.id}`}
              image={category.image}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}