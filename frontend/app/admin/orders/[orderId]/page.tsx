"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Package, User, CreditCard } from "lucide-react";
import { getAdminOrderById, updateOrderStatus } from "@/lib/adminOrderApi";
import { useToast } from "@/components/Toast";

const STATUS_OPTIONS = [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "PAYMENT_FAILED",
    "CANCELLED",
    "REPLACEMENT_REQUESTED",
    "REPLACEMENT_APPROVED",
    "REPLACEMENT_REJECTED",
  ];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    getAdminOrderById(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast({ variant: "success", title: "Order status updated" });
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to update status",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </div>
    );
  }

  if (!order) {
    return <p className="font-sans text-sm text-[#4A4A4A]">Order not found.</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">{order.orderNumber}</h1>
          <p className="mt-1 font-sans text-xs text-[#4A4A4A]">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="border border-[#E8D8C5] bg-white px-3 py-2 font-sans text-xs uppercase tracking-wide text-[#2A1E17] outline-none focus:border-[#B08D57] disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Customer */}
      <div className="border border-[#E8D8C5] bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
          <User size={14} strokeWidth={1.5} className="text-[#B08D57]" />
          Customer
        </h2>
        {order.user ? (
          <div className="font-sans text-sm text-[#4A4A4A]">
            <p>{order.user.firstName} {order.user.lastName}</p>
            <p>{order.user.email}</p>
            {order.user.phone && <p>{order.user.phone}</p>}
          </div>
        ) : (
          <p className="font-sans text-sm text-[#4A4A4A]">Guest: {order.guestEmail}</p>
        )}
      </div>

      {/* Shipping */}
      <div className="border border-[#E8D8C5] bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
          <Package size={14} strokeWidth={1.5} className="text-[#B08D57]" />
          Shipping Address
        </h2>
        <div className="font-sans text-sm text-[#4A4A4A]">
          <p>{order.shippingFullName} · {order.shippingPhone}</p>
          <p>
            {order.shippingAddressLine1}
            {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}, {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
          </p>
        </div>
      </div>

      {/* Payment */}
      {order.payment && (
        <div className="border border-[#E8D8C5] bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
            <CreditCard size={14} strokeWidth={1.5} className="text-[#B08D57]" />
            Payment
          </h2>
          <div className="font-sans text-sm text-[#4A4A4A]">
            <p>Method: {order.payment.paymentMethod ?? "—"}</p>
            <p>Status: {order.payment.paymentStatus}</p>
            {order.payment.transactionId && <p>Transaction ID: {order.payment.transactionId}</p>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="border border-[#E8D8C5] bg-white p-5">
        <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
          Items
        </h2>
        <div className="space-y-2">
          {order.orderItems?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between font-sans text-sm text-[#4A4A4A]">
              <span>
                {item.productName} ({item.color}, {item.size}) × {item.quantity}
              </span>
              <span className="text-[#2A1E17]">₹{item.lineTotal}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[#E8D8C5] pt-4 font-sans text-sm text-[#4A4A4A]">
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
            <span>₹{order.shippingCost}</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-[#E8D8C5] pt-3 font-sans text-base font-semibold text-[#2A1E17]">
          <span>Total</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}