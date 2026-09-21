"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Star, X } from "lucide-react";
import { getAddresses, createAddress, deleteAddress } from "@/lib/addressApi";
import type { Address } from "@/lib/addressTypes";
import { useToast } from "@/components/Toast";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function AddressesPage() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAddress(form);
      showToast({ variant: "success", title: "Address saved" });
      setForm(emptyForm);
      setShowForm(false);
      loadAddresses();
    } catch {
      showToast({ variant: "error", title: "Failed to save address" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      showToast({ variant: "info", title: "Address removed" });
      loadAddresses();
    } catch {
      showToast({ variant: "error", title: "Failed to remove address" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-start justify-between gap-4 border border-[#E8D8C5] bg-white p-5">
          <div className="font-sans text-sm text-[#2A1E17]">
            <div className="flex items-center gap-2">
              <p className="font-medium">{addr.fullName}</p>
              {addr.isDefault && (
                <span className="flex items-center gap-1 bg-[#B08D57]/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-[#B08D57]">
                  <Star size={10} strokeWidth={1.5} className="fill-[#B08D57]" />
                  Default
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#4A4A4A]">
              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.postalCode}
            </p>
            <p className="mt-1 text-xs text-[#4A4A4A]">{addr.phone}</p>
          </div>
          <button
            onClick={() => handleDelete(addr.id)}
            aria-label="Delete address"
            className="shrink-0 text-[#4A4A4A] transition-colors hover:text-[#B5654F]"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="border border-[#E8D8C5] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[var(--font-playfair)] text-base text-[#2A1E17]">New Address</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Cancel">
              <X size={16} strokeWidth={1.5} className="text-[#4A4A4A]" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, "").slice(0, 10) })} required />
            <Field label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required className="sm:col-span-2" />
            <Field label="Address Line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} className="sm:col-span-2" />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
            <Field label="Postal Code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v.replace(/\D/g, "").slice(0, 6) })} required />
          </div>

          <label className="mt-3 flex items-center gap-2 font-sans text-xs text-[#2A1E17]">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default address
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 h-11 w-full bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-[#B08D57]/50 bg-white py-4 font-sans text-xs uppercase tracking-[0.15em] text-[#B08D57] hover:bg-[#B08D57]/5"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add New Address
        </button>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, required = false, className = "",
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-sans text-xs text-[#2A1E17]">{label}{required && " *"}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
      />
    </label>
  );
}