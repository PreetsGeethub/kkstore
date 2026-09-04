import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CategoryCard from "./CategoryCard";

const categories = [
  {
    name: "Necklaces",
    href: "/products?category=necklaces",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Earrings",
    href: "/products?category=earrings",
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Rings",
    href: "/products?category=rings",
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Bracelets",
    href: "/products?category=bracelets",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Anklets",
    href: "/products?category=anklets",
    image:
      "https://images.unsplash.com/photo-1620656798579-1284503a959f?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Jewellery Sets",
    href: "/products?category=jewellery-sets",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop",
  },
];

export default function ShopByCategory() {
  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Section header */}
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

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              href={category.href}
              image={category.image}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}