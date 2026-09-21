"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/Cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mb-4 text-[#B08D57]" />
        <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-xs font-sans text-sm text-[#4A4A4A]">
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
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
          Shopping Cart
        </h1>
        <p className="mb-10 font-sans text-sm text-[#4A4A4A]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        {/* Free shipping progress */}
        {remainingForFreeShipping > 0 ? (
          <div className="mb-8 border border-[#E8D8C5] bg-white p-4">
            <p className="font-sans text-xs text-[#2A1E17]">
              Add <span className="font-semibold text-[#B08D57]">₹{remainingForFreeShipping}</span> more for free shipping
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden bg-[#E8D8C5]">
              <div
                className="h-full bg-[#B08D57] transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-8 border border-[#B08D57]/30 bg-[#B08D57]/10 p-4">
            <p className="font-sans text-xs font-medium text-[#2A1E17]">
              🎉 You&apos;ve unlocked free shipping!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5]">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex gap-4 py-6"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#E8D8C5] sm:h-28 sm:w-28">
                    <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-medium text-[#2A1E17] sm:text-base">
                          {item.name}
                        </p>
                        <p className="mt-1 font-sans text-xs text-[#4A4A4A]">
                          {item.color} · {item.size}
                        </p>
                        {item.quantity >= item.maxStock && (
                          <p className="mt-1 font-sans text-[11px] text-[#B08D57]">
                            Max stock reached
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        aria-label="Remove item"
                        className="shrink-0 text-[#4A4A4A] transition-colors duration-200 hover:text-[#B5654F]"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#E8D8C5]">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.color, item.size, item.quantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center text-[#2A1E17] transition-colors hover:bg-[#E8D8C5]/40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center font-sans text-sm text-[#2A1E17]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.color, item.size, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxStock}
                          className="flex h-9 w-9 items-center justify-center text-[#2A1E17] transition-colors hover:bg-[#E8D8C5]/40 disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-2">
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="font-sans text-xs text-[#4A4A4A] line-through">
                            ₹{item.comparePrice * item.quantity}
                          </span>
                        )}
                        <span className="font-[var(--font-playfair)] text-base font-semibold text-[#2A1E17]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-[#E8D8C5] bg-white p-6">
              <h2 className="mb-5 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                Order Summary
              </h2>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between text-[#4A4A4A]">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#4A4A4A]">
                  <span>Shipping</span>
                  <span>
                    {remainingForFreeShipping > 0 ? "Calculated at checkout" : "Free"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-[#E8D8C5] pt-4 font-sans text-base font-semibold text-[#2A1E17]">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
              >
                Proceed to Checkout
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>

              <Link
                href="/products"
                className="mt-3 flex h-12 w-full items-center justify-center border border-[#E8D8C5] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:border-[#B08D57]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}