"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { getProducts } from "@/lib/productApi";
import { deleteProduct } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    getProducts({ status: "all", limit: 100 })
      .then(({ products }) => setProducts(products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This can not be undone from here.`)) return;

    setDeletingId(id);
    try {
      await deleteProduct(id);
      showToast({ variant: "info", title: "Product deleted" });
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#B08D57] px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#C9A96E]"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add Product
        </Link>
      </div>

      {loading ? (
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      ) : (
        <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5] bg-white">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <img
                src={p.thumbnail ?? "/placeholder-product.jpg"}
                alt={p.name}
                className="h-12 w-12 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm text-[#2A1E17]">{p.name}</p>
                <p className="font-sans text-xs text-[#4A4A4A]">
                  {p.category?.name} - Rs.{p.startingPrice} - {p.totalStock} in stock
                  {!p.status && <span className="ml-2 text-[#B5654F]">(Inactive)</span>}
                </p>
              </div>
              <Link
                href={`/admin/products/${p.id}/edit`}
                aria-label="Edit product"
                className="shrink-0 text-[#4A4A4A] hover:text-[#B08D57]"
              >
                <Pencil size={16} strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                disabled={deletingId === p.id}
                aria-label="Delete product"
                className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F] disabled:opacity-50"
              >
                {deletingId === p.id ? (
                  <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Trash2 size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
