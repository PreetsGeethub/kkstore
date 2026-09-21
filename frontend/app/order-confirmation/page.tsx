"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import { getOrder } from "@/lib/checkoutApi";

type OrderItem = {
  quantity: number;
  color: string;
  size: string;
  productName: string;
  priceAtPurchase: number;
  lineTotal: number;
};

type OrderDetails = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  shippingFullName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  orderItems: OrderItem[];
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    getOrder(orderId)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null)) // fails soft — e.g. guest checkout can't fetch via this endpoint yet
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FAF7F2]">
        <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </main>
    );
  }

  return (
    <main className="bg-[#FAF7F2] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7A9B76]/10">
          <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#7A9B76]" />
        </div>

        <h1 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl">
          Order Placed Successfully
        </h1>
        <p className="mt-3 font-sans text-sm text-[#4A4A4A]">
          Thank you for shopping with KK Store. We&apos;ve received your order
          and will start preparing it right away.
        </p>

        {!order && (
          <p className="mt-6 font-sans text-xs text-[#4A4A4A]">
            Check your email for your order confirmation and details.
          </p>
        )}

        {order && (
          <div className="mt-10 border border-[#E8D8C5] bg-white p-6 text-left">
            <div className="mb-5 flex items-center justify-between border-b border-[#E8D8C5] pb-4">
              <div>
                <p className="font-sans text-xs text-[#4A4A4A]">Order Number</p>
                <p className="font-sans text-sm font-medium text-[#2A1E17]">
                  {order.orderNumber}
                </p>
              </div>
              <span className="bg-[#B08D57]/10 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#B08D57]">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            {order.orderItems?.length > 0 && (
              <div className="space-y-2 border-b border-[#E8D8C5] pb-4">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between font-sans text-xs text-[#4A4A4A]">
                    <span>
                      {item.productName} ({item.color}, {item.size}) × {item.quantity}
                    </span>
                    <span className="text-[#2A1E17]">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-start gap-3 border-b border-[#E8D8C5] pb-4">
              <Package size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#B08D57]" />
              <div className="font-sans text-xs text-[#4A4A4A]">
                <p className="font-medium text-[#2A1E17]">{order.shippingFullName}</p>
                <p>
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""},{" "}
                  {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 font-sans text-xs text-[#4A4A4A]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#B08D57]">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : `₹${order.shippingCost}`}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-between border-t border-[#E8D8C5] pt-3 font-sans text-sm font-semibold text-[#2A1E17]">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 border border-[#2A1E17] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#2A1E17] hover:text-white"
          >
            Track Your Order
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-[#B08D57] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
          >
            Continue Shopping
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </main>
  );
}