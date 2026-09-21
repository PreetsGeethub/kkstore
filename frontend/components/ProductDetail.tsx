"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useCart } from "./Cart";
import { useWishlist } from "./Wishlist";

import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Droplets,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";
import { useToast } from "./Toast";
import type { ApiProduct, ProductVariant } from "@/lib/types";

type ProductDetailProps = {
  product: ApiProduct;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { showToast } = useToast();

  const sortedImages = useMemo(
    () => [...product.images].sort((a, b) => a.sortOrder - b.sortOrder),
    [product.images]
  );

  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color))], [product.variants]);
  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size))], [product.variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showGif, setShowGif] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Zoom lens state
  const imageRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const hasDiscount =
    selectedVariant?.comparePrice !== undefined && selectedVariant.comparePrice > selectedVariant.price;

  const discountPercent =
    hasDiscount && selectedVariant
      ? Math.round(((selectedVariant.comparePrice! - selectedVariant.price) / selectedVariant.comparePrice!) * 100)
      : 0;

  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const lowStock = inStock && (selectedVariant?.stock ?? 0) <= 5;

  const isColorAvailable = (color: string) => product.variants.some((v) => v.color === color && v.stock > 0);
  const isSizeAvailable = (size: string) =>
    product.variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0);

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!inStock || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id, // now included
      name: product.name,
      image: sortedImages[0]?.imageUrl ?? "/placeholder-product.jpg",
      color: selectedColor,
      size: selectedSize,
      price: selectedVariant.price,
      comparePrice: selectedVariant.comparePrice,
      quantity,
      maxStock: selectedVariant.stock,
    });
  };
  const handleBuyNow = () => {
    if (!inStock || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: sortedImages[0]?.imageUrl ?? "/placeholder-product.jpg",
      color: selectedColor,
      size: selectedSize,
      price: selectedVariant.price,
      comparePrice: selectedVariant.comparePrice,
      quantity,
      maxStock: selectedVariant.stock,
    });
    router.push("/checkout");
  };
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  
  const toggleWishlist = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      image: sortedImages[0]?.imageUrl ?? "/placeholder-product.jpg",
      price: selectedVariant?.price ?? 0,
      comparePrice: selectedVariant?.comparePrice,
    });
  };

  const currentImageUrl = sortedImages[activeMediaIndex]?.imageUrl ?? "/placeholder-product.jpg";

  return (
    <main className="bg-[#FAF7F2] pb-24 lg:pb-16">
      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-12 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              ref={imageRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square cursor-zoom-in overflow-hidden bg-[#E8D8C5]"
            >
              {showGif && product.gifUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.gifUrl}
                  alt={`${product.name} animated preview`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {/* Base image */}
                  <Image
                    src={currentImageUrl}
                    alt={product.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={`object-cover transition-opacity duration-200 ${
                      isZooming ? "opacity-0" : "opacity-100"
                    }`}
                  />

                  {/* Zoomed layer — follows cursor via background-position */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 transition-opacity duration-200 ${
                      isZooming ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    style={{
                      backgroundImage: `url(${currentImageUrl})`,
                      backgroundSize: "200%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </>
              )}

              {hasDiscount && (
                <span className="absolute left-4 top-4 z-10 bg-[#B08D57] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17]">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {sortedImages.map((img, index) => (
                <button
                  key={img.imageUrl}
                  onClick={() => {
                    setActiveMediaIndex(index);
                    setShowGif(false);
                  }}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border transition-colors duration-200 ${
                    !showGif && activeMediaIndex === index ? "border-[#B08D57]" : "border-[#E8D8C5]"
                  }`}
                >
                  <Image src={img.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}

              {product.gifUrl && (
                <button
                  onClick={() => setShowGif(true)}
                  className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border bg-[#2A1E17] transition-colors duration-200 ${
                    showGif ? "border-[#B08D57]" : "border-[#E8D8C5]"
                  }`}
                >
                  <Sparkles size={18} strokeWidth={1.5} className="text-[#B08D57]" />
                  <span className="absolute bottom-1 font-sans text-[8px] uppercase tracking-wider text-white">
                    GIF
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.isNewArrival && (
              <span className="mb-3 inline-block bg-[#2A1E17] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white">
                New Arrival
              </span>
            )}

            <h1 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              {selectedVariant ? (
                <>
                  <span className="font-[var(--font-playfair)] text-2xl font-semibold text-[#2A1E17]">
                    ₹{selectedVariant.price}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="font-sans text-base text-[#4A4A4A] line-through">
                        ₹{selectedVariant.comparePrice}
                      </span>
                      <span className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-[#B08D57]">
                        {discountPercent}% off
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="font-sans text-sm text-[#4A4A4A]">Select options to see price</span>
              )}
            </div>

            <p className="mt-5 max-w-md font-sans text-sm leading-6 text-[#4A4A4A]">{product.description}</p>

            {colors.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
                  Color: <span className="font-normal text-[#4A4A4A]">{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => {
                    const available = isColorAvailable(color);
                    return (
                      <button
                        key={color}
                        onClick={() => available && setSelectedColor(color)}
                        disabled={!available}
                        className={`border px-4 py-2 font-sans text-xs uppercase tracking-[0.1em] transition-colors duration-200 ${
                          selectedColor === color
                            ? "border-[#B08D57] bg-[#B08D57]/10 text-[#2A1E17]"
                            : available
                            ? "border-[#E8D8C5] text-[#4A4A4A] hover:border-[#B08D57]"
                            : "border-[#E8D8C5] text-[#4A4A4A]/30 line-through"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && sizes[0] !== "Free" && (
              <div className="mt-6">
                <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
                  Size: <span className="font-normal text-[#4A4A4A]">{selectedSize}</span>
                </p>
                <div className="flex gap-2">
                  {sizes.map((size) => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`h-10 min-w-10 border px-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors duration-200 ${
                          selectedSize === size
                            ? "border-[#B08D57] bg-[#B08D57]/10 text-[#2A1E17]"
                            : available
                            ? "border-[#E8D8C5] text-[#4A4A4A] hover:border-[#B08D57]"
                            : "border-[#E8D8C5] text-[#4A4A4A]/30 line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5">
              {!inStock ? (
                <p className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-[#B5654F]">
                  Out of Stock
                </p>
              ) : lowStock ? (
                <p className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-[#B08D57]">
                  Only {selectedVariant?.stock} left in stock
                </p>
              ) : (
                <p className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-[#7A9B76]">
                  In Stock
                </p>
              )}
            </div>

            <div className="mt-6 hidden items-center gap-4 lg:flex">
              <div className="flex items-center border border-[#E8D8C5]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-11 items-center justify-center text-[#2A1E17] transition-colors hover:bg-[#E8D8C5]/40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center font-sans text-sm text-[#2A1E17]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))}
                  className="flex h-12 w-11 items-center justify-center text-[#2A1E17] transition-colors hover:bg-[#E8D8C5]/40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex h-12 flex-1 items-center justify-center gap-2 border border-[#2A1E17] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#2A1E17] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag size={15} strokeWidth={1.5} />
                Add to Cart
              </button>

              <button
                onClick={toggleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#E8D8C5] text-[#2A1E17] transition-colors duration-300 hover:border-[#B08D57]"
              >
                <Heart size={17} strokeWidth={1.5} className={wishlisted ? "fill-[#B08D57] text-[#B08D57]" : ""} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="mt-3 hidden h-12 w-full items-center justify-center bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
            >
              Buy Now
            </button>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#E8D8C5] pt-6 sm:grid-cols-3">
              {product.isAntiTarnish && <FeatureBadge icon={Sparkles} label="Anti-Tarnish" />}
              {product.isWaterproof && <FeatureBadge icon={Droplets} label="Sweat Resistant" />}
              {product.isSkinFriendly && <FeatureBadge icon={ShieldCheck} label="Skin-Friendly" />}
            </div>

            <div className="mt-8 space-y-4 border-t border-[#E8D8C5] pt-6 font-sans text-sm text-[#4A4A4A]">
              <div className="flex justify-between gap-4">
                <span className="text-[#2A1E17]">Material</span>
                <span>{product.material}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#2A1E17]">Care Instructions</span>
                <span className="text-right">{product.careInstructions}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-[#2A1E17]">
                  <Truck size={15} strokeWidth={1.5} className="text-[#B08D57]" />
                  Estimated Delivery
                </span>
                <span>3–7 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#E8D8C5] bg-[#FAF7F2] p-4 shadow-[0_-4px_16px_rgba(42,30,23,0.08)] lg:hidden">
        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#E8D8C5] text-[#2A1E17]"
        >
          <Heart size={17} strokeWidth={1.5} className={wishlisted ? "fill-[#B08D57] text-[#B08D57]" : ""} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 border border-[#2A1E17] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] disabled:opacity-40"
        >
          <ShoppingBag size={15} strokeWidth={1.5} />
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex h-12 flex-1 items-center justify-center bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </main>
  );
}

function FeatureBadge({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#B08D57]/40 text-[#B08D57]">
        <Icon size={14} strokeWidth={1.5} />
      </div>
      <span className="font-sans text-xs text-[#2A1E17]">{label}</span>
    </div>
  );
}