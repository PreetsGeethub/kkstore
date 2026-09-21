"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { WishlistItem } from "@/lib/wishlistTypes";
import { useToast } from "./Toast";

type WishlistContextValue = {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  itemCount: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { showToast } = useToast();

  const isWishlisted = (productId: string) =>
    items.some((i) => i.productId === productId);

  const toggleItem = (item: WishlistItem) => {
    const exists = items.some((i) => i.productId === item.productId);
  
    setItems((prev) =>
      exists
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item]
    );
  
    showToast({
      variant: exists ? "info" : "success",
      title: exists ? "Removed from wishlist" : "Added to wishlist",
      description: item.name,
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const itemCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{ items, toggleItem, removeItem, isWishlisted, itemCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}