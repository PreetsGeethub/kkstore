"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

type Tab = "bestsellers" | "new" | "trending";

const tabs: { id: Tab; label: string; sortParam: string }[] = [
  { id: "bestsellers", label: "Bestsellers", sortParam: "bestselling" },
  { id: "new", label: "New Arrivals", sortParam: "newest" },
  { id: "trending", label: "Trending", sortParam: "trending" },
];

// Placeholder data per tab — later each becomes its own fetch,
// e.g. fetch(`/api/products?sort=${sortParam}&limit=4`)
const productsByTab: Record<Tab, Product[]> = {
  bestsellers: [
    {
      id: "placeholder-1",
      name: "Aria Layered Necklace",
      price: 899,
      discountPrice: 649,
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
      hoverImage:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      isBestseller: true,
    },
    {
      id: "placeholder-2",
      name: "Mira Hoop Earrings",
      price: 549,
      image:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "placeholder-3",
      name: "Elle Stackable Ring",
      price: 399,
      image:
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "placeholder-4",
      name: "Noor Chain Bracelet",
      price: 699,
      discountPrice: 559,
      image:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop",
    },
  ],
  new: [
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
  ],
  trending: [
    {
      id: "placeholder-9",
      name: "Luna Huggie Earrings",
      price: 429,
      image:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "placeholder-10",
      name: "Wren Layered Bracelet",
      price: 599,
      image:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "placeholder-11",
      name: "Sage Signet Ring",
      price: 379,
      discountPrice: 319,
      image:
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "placeholder-12",
      name: "Nova Chain Necklace",
      price: 749,
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
    },
  ],
};

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("bestsellers");
  const activeMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Header row */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#B08D57]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
                Shop the Edit
              </span>
            </div>
            <h2 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
              {activeMeta.label}
            </h2>
          </div>

          <Link
            href={`/products?sort=${activeMeta.sortParam}`}
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

        {/* Tabs */}
        <div className="mb-10 flex items-center gap-8 border-b border-[#E8D8C5]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-[#2A1E17]"
                  : "text-[#4A4A4A] hover:text-[#2A1E17]"
              }`}
            >
              {tab.label}
              <span
                className={`absolute inset-x-0 -bottom-px h-[2px] bg-[#B08D57] transition-transform duration-300 ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div
          key={activeTab}
          className="grid animate-[fadeIn_0.4s_ease-out_both] grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          {productsByTab[activeTab].map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}