"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";
import { getOrders } from "@/lib/orderApi";

type OrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: { productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border border-[#E8D8C5] bg-white p-10 text-center">
        <Package size={32} strokeWidth={1} className="mx-auto mb-3 text-[#B08D57]" />
        <p className="font-sans text-sm text-[#4A4A4A]">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-4 inline-block bg-[#B08D57] px-6 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] hover:bg-[#C9A96E]"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block border border-[#E8D8C5] bg-white p-5 transition-colors duration-200 hover:border-[#B08D57]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-sm font-medium text-[#2A1E17]">{order.orderNumber}</p>
              <p className="mt-1 font-sans text-xs text-[#4A4A4A]">
                {order.orderItems.map((i) => i.productName).join(", ")}
              </p>
              <p className="mt-1 font-sans text-xs text-[#4A4A4A]">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-[#B08D57]/10 px-2.5 py-1 font-sans text-[9px] font-medium uppercase tracking-[0.1em] text-[#B08D57]">
                {order.status.replace(/_/g, " ")}
              </span>
              <p className="mt-2 font-sans text-sm font-semibold text-[#2A1E17]">
                ₹{order.totalAmount}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}