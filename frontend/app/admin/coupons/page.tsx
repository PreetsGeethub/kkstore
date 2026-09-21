"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";
import { getCoupons, createCoupon, deleteCoupon, type CouponPayload } from "@/lib/adminCouponApi";
import { useToast } from "@/components/Toast";

const emptyForm = {
  code: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: "",
  minimumOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    getCoupons()
      .then(({ coupons }) => setCoupons(coupons))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim() || !form.discountValue || !form.startsAt || !form.expiresAt) {
      showToast({ variant: "error", title: "Fill in all required fields" });
      return;
    }

    setSaving(true);
    try {
      const payload: CouponPayload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };

      await createCoupon(payload);
      showToast({ variant: "success", title: "Coupon created" });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to create coupon",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, code: string) => {
    if (!confirm(`Deactivate coupon "${code}"?`)) return;

    setDeletingId(id);
    try {
      await deleteCoupon(id);
      showToast({ variant: "info", title: "Coupon deactivated" });
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to deactivate coupon",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Coupons</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-[#B08D57] px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#C9A96E]"
        >
          <Plus size={14} strokeWidth={1.5} />
          New Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border border-[#E8D8C5] bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Coupon Code *</span>
              <input
                type="text"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="SAVE10"
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm uppercase text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Discount Type *</span>
              <select
                value={form.discountType}
                onChange={(e) => updateField("discountType", e.target.value)}
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">
                Discount Value * {form.discountType === "PERCENTAGE" ? "(max 100)" : "(₹)"}
              </span>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => updateField("discountValue", e.target.value)}
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Minimum Order Amount (optional)</span>
              <input
                type="number"
                value={form.minimumOrderAmount}
                onChange={(e) => updateField("minimumOrderAmount", e.target.value)}
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Usage Limit (optional)</span>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => updateField("usageLimit", e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>

            <div />

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Starts At *</span>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => updateField("startsAt", e.target.value)}
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Expires At *</span>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => updateField("expiresAt", e.target.value)}
                className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Create Coupon"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      ) : coupons.length === 0 ? (
        <p className="font-sans text-sm text-[#4A4A4A]">No coupons yet.</p>
      ) : (
        <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5] bg-white">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-4 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#B08D57]/10 text-[#B08D57]">
                <Tag size={15} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-medium text-[#2A1E17]">{coupon.code}</p>
                <p className="font-sans text-xs text-[#4A4A4A]">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}% off`
                    : `₹${coupon.discountValue} off`}
                  {coupon.minimumOrderAmount && ` · Min ₹${coupon.minimumOrderAmount}`}
                  {" · "}
                  {coupon.usedCount}/{coupon.usageLimit ?? "∞"} used
                  {!coupon.isActive && <span className="ml-2 text-[#B5654F]">(Inactive)</span>}
                </p>
              </div>
              {coupon.isActive && (
                <button
                  onClick={() => handleDeactivate(coupon.id, coupon.code)}
                  disabled={deletingId === coupon.id}
                  aria-label="Deactivate coupon"
                  className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F] disabled:opacity-50"
                >
                  {deletingId === coupon.id ? (
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} strokeWidth={1.5} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}