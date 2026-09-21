"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/cartTypes";
import { useToast } from "./Toast";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  const findIndex = (list: CartItem[], productId: string, color: string, size: string) =>
    list.findIndex((i) => i.productId === productId && i.color === color && i.size === size);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = findIndex(prev, newItem.productId, newItem.color, newItem.size);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].quantity + newItem.quantity,
          newItem.maxStock
        );
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }

      return [...prev, newItem];
    });

    showToast({
      variant: "cart",
      title: "Added to cart",
      description: `${newItem.name} — ${newItem.color}, ${newItem.size}`,
    });
  };

  const removeItem = (productId: string, color: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.color === color && i.size === size)));
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    setItems((prev) => {
      const index = findIndex(prev, productId, color, size);
      if (index === -1) return prev;

      if (quantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }

      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.min(quantity, updated[index].maxStock) };
      return updated;
    });
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}