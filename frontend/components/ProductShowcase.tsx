"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";
import { getProducts } from "@/lib/productApi";
import { listItemToCardProduct } from "@/lib/adapters";

type Tab = "new" | "all";

const tabs: { id: Tab; label: string; sortParam: string }[] = [
  { id: "new", label: "New Arrivals", sortParam: "newest" },
  { id: "all", label: "Shop All", sortParam: "" },
];

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const activeMeta = tabs.find((t) => t.id === activeTab)!;

  useEffect(() => {
    setLoading(true);
    getProducts({ sortBy: "createdAt", order: "desc", limit: 4 })
      .then(({ products: apiProducts }) => setProducts(apiProducts.map(listItemToCardProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
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
            href="/products?sort=newest"
            className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-[#2A1E17]"
          >
            View All
            <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#B08D57] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center font-sans text-sm text-[#4A4A4A]">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}