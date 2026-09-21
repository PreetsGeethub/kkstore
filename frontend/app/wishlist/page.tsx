"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/Wishlist";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center">
        <Heart size={40} strokeWidth={1} className="mb-4 text-[#B08D57]" />
        <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">
          Your wishlist is empty
        </h1>
        <p className="mt-2 max-w-xs font-sans text-sm text-[#4A4A4A]">
          Save pieces you love here so you can find them again easily.
        </p>
        <Link
          href="/products"
          className="mt-6 flex items-center gap-2 bg-[#B08D57] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
        >
          Start Shopping
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#FAF7F2] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="mb-2 font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl">
          Wishlist
        </h1>
        <p className="mb-10 font-sans text-sm text-[#4A4A4A]">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const hasDiscount = item.comparePrice && item.comparePrice > item.price;

            return (
              <div
                key={item.productId}
                className="group border border-[#E8D8C5] bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(42,30,23,0.06)]"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="relative block aspect-square overflow-hidden bg-[#E8D8C5]"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.productId);
                    }}
                    aria-label="Remove from wishlist"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-[#E8D8C5] bg-[#FAF7F2] text-[#2A1E17] transition-colors duration-200 hover:border-[#B5654F] hover:text-[#B5654F]"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${item.productId}`} className="block">
                    <p className="line-clamp-1 font-sans text-sm text-[#2A1E17]">{item.name}</p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-[var(--font-playfair)] text-base font-semibold text-[#2A1E17]">
                        ₹{item.price}
                      </span>
                      {hasDiscount && (
                        <span className="font-sans text-xs text-[#4A4A4A] line-through">
                          ₹{item.comparePrice}
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => router.push(`/products/${item.productId}`)}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-[#2A1E17] font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#2A1E17] hover:text-white"
                  >
                    <ShoppingBag size={13} strokeWidth={1.5} />
                    Select Options
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}