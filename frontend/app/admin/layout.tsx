"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LayoutDashboard, Plus, Tag } from "lucide-react";
import { useAuth } from "@/components/Auth";
import { Package } from "lucide-react"; // add to imports
import {ShoppingBag} from "lucide-react"; // add to imports
import { Star } from "lucide-react"; // add to imports
// add this link before "Add Product":

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FAF7F2]">
        <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#FAF7F2]">
      <aside className="w-56 shrink-0 border-r border-[#E8D8C5] bg-white p-6">
        <p className="mb-6 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
          Admin Panel
        </p>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
          >
            <LayoutDashboard size={15} strokeWidth={1.5} />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
          >
            <Package size={15} strokeWidth={1.5} />
            Products
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
          >
            <Plus size={15} strokeWidth={1.5} />
            Add Product
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
          >
            <Tag size={15} strokeWidth={1.5} />
            Categories
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            Orders
          </Link>
          <Link
  href="/admin/reviews"
  className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
>
  <Star size={15} strokeWidth={1.5} />
  Reviews
</Link>
        </nav>
        <Link
  href="/admin/coupons"
  className="flex items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#4A4A4A] hover:bg-[#FAF7F2]"
>
  <Tag size={15} strokeWidth={1.5} />
  Coupons
</Link>
      </aside>

      <div className="flex-1 p-8">{children}</div>
    </main>
  );
}