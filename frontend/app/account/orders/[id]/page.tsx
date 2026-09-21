"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Package } from "lucide-react";
import { getOrder } from "@/lib/checkoutApi";

type OrderItem = {
  quantity: number;
  color: string;
  size: string;
  productName: string;
  lineTotal: number;
};

type OrderDetails = {
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  shippingFullName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  orderItems: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="border border-[#E8D8C5] bg-white p-10 text-center font-sans text-sm text-[#4A4A4A]">
        Order not found.
      </div>
    );
  }

  return (
    <div className="border border-[#E8D8C5] bg-white p-6">
      <div className="mb-5 flex items-center justify-between border-b border-[#E8D8C5] pb-4">
        <div>
          <p className="font-sans text-xs text-[#4A4A4A]">Order Number</p>
          <p className="font-sans text-sm font-medium text-[#2A1E17]">{order.orderNumber}</p>
        </div>
        <span className="bg-[#B08D57]/10 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#B08D57]">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="space-y-2 border-b border-[#E8D8C5] pb-4">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex justify-between font-sans text-xs text-[#4A4A4A]">
            <span>{item.productName} ({item.color}, {item.size}) × {item.quantity}</span>
            <span className="text-[#2A1E17]">₹{item.lineTotal}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 border-b border-[#E8D8C5] pb-4">
        <Package size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#B08D57]" />
        <div className="font-sans text-xs text-[#4A4A4A]">
          <p className="font-medium text-[#2A1E17]">{order.shippingFullName}</p>
          <p>
            {order.shippingAddressLine1}
            {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}, {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-[#E8D8C5] pt-3 font-sans text-sm font-semibold text-[#2A1E17]">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>
    </div>
  );
}