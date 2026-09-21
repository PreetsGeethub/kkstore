"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "./Wishlist";

export type Product = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  isBestseller?: boolean;
};

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const router = useRouter();

  const hasDiscount =
    product.discountPrice !== undefined && product.discountPrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.discountPrice ?? product.price,
      comparePrice: product.discountPrice ? product.price : undefined,
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    // Sends the customer to pick a real color/size, since a grid card
    // has no variant selection — avoids silently adding a wrong/fake variant.
    router.push(`/products/${product.id}`);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#E8D8C5]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition-opacity duration-500 ${
            product.hoverImage ? "lg:group-hover:opacity-0" : "lg:group-hover:scale-105"
          }`}
        />

        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-[#2A1E17] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#B08D57] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-[#2A1E17]">
              {discountPercent}% Off
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-white/50 bg-white/20 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/30"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={wishlisted ? "fill-[#B08D57] text-[#B08D57]" : ""}
          />
        </button>

        <button
          type="button"
          aria-label="Select options"
          onClick={handleQuickAdd}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-[#FAF7F2] py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
        >
          <ShoppingBag size={13} strokeWidth={1.5} />
          Select Options
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <p className="font-sans text-sm text-[#2A1E17]">{product.name}</p>

        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-[var(--font-playfair)] text-lg font-semibold text-[#2A1E17]">
                ₹{product.discountPrice}
              </span>
              <span className="font-sans text-xs text-[#4A4A4A] line-through decoration-[#4A4A4A]/60">
                ₹{product.price}
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#B08D57]">
                {discountPercent}% off
              </span>
            </>
          ) : (
            <span className="font-[var(--font-playfair)] text-lg font-semibold text-[#2A1E17]">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}