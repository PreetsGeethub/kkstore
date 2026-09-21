"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { getAllOrders } from "@/lib/adminOrderApi";

const STATUS_OPTIONS = [
  "all",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusColor: Record<string, string> = {
    PENDING_PAYMENT: "text-[#B08D57] bg-[#B08D57]/10",
    CONFIRMED: "text-[#7A9B76] bg-[#7A9B76]/10",
    PACKED: "text-[#B08D57] bg-[#B08D57]/10",
    SHIPPED: "text-[#4A4A4A] bg-[#4A4A4A]/10",
    OUT_FOR_DELIVERY: "text-[#4A4A4A] bg-[#4A4A4A]/10",
    DELIVERED: "text-[#7A9B76] bg-[#7A9B76]/10",
    PAYMENT_FAILED: "text-[#B5654F] bg-[#B5654F]/10",
    CANCELLED: "text-[#B5654F] bg-[#B5654F]/10",
    REPLACEMENT_REQUESTED: "text-[#B08D57] bg-[#B08D57]/10",
    REPLACEMENT_APPROVED: "text-[#7A9B76] bg-[#7A9B76]/10",
    REPLACEMENT_REJECTED: "text-[#B5654F] bg-[#B5654F]/10",
  };
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    getAllOrders({ search, status: statusFilter })
      .then(({ orders }) => setOrders(orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <h1 className="mb-6 font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Orders</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-[#E8D8C5] bg-white px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 border border-[#2A1E17] px-4 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-white"
          >
            <Search size={14} strokeWidth={1.5} />
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E8D8C5] bg-white px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      ) : orders.length === 0 ? (
        <p className="font-sans text-sm text-[#4A4A4A]">No orders found.</p>
      ) : (
        <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5] bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-[#FAF7F2]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-medium text-[#2A1E17]">{order.orderNumber}</p>
                <p className="mt-0.5 font-sans text-xs text-[#4A4A4A]">
                  {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Guest"} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 font-sans text-[9px] font-medium uppercase tracking-[0.1em] ${
                  statusColor[order.status] ?? "text-[#4A4A4A] bg-[#4A4A4A]/10"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
              <span className="shrink-0 font-sans text-sm font-semibold text-[#2A1E17]">
                ₹{order.totalAmount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}