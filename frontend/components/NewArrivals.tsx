import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

// Placeholder data — later this becomes something like:
// const newArrivals = await fetch("/api/products?sort=newest&limit=4")
const newArrivals: Product[] = [
  {
    id: "placeholder-5",
    name: "Zara Pendant Necklace",
    price: 649,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    isNew: true,
  },
  {
    id: "placeholder-6",
    name: "Ivy Drop Earrings",
    price: 449,
    discountPrice: 379,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    isNew: true,
  },
  {
    id: "placeholder-7",
    name: "Rae Anklet",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1602752250015-52934bc45613?q=80&w=800&auto=format&fit=crop",
    isNew: true,
  },
  {
    id: "placeholder-8",
    name: "Bloom Jewellery Set",
    price: 1199,
    discountPrice: 949,
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop",
    isNew: true,
  },
];

export default function NewArrivals() {
  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#B08D57]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
                Just In
              </span>
            </div>
            <h2 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/products?sort=newest"
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

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}