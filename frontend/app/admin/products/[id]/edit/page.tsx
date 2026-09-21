"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { getProductById } from "@/lib/productApi";
import { getCategories, updateProduct } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";

const emptyVariant = { sku: "", color: "", size: "", price: 0, comparePrice: undefined, stock: 0 };

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    material: "",
    careInstructions: "",
    gifUrl: "",
    isAntiTarnish: false,
    isWaterproof: false,
    isSkinFriendly: false,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
  });

  const [images, setImages] = useState([{ imageUrl: "", sortOrder: 0 }]);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);

  useEffect(() => {
    Promise.all([getProductById(productId), getCategories().catch(() => [])]).then(
      ([product, cats]) => {
        setCategories(cats);
        if (product) {
          setForm({
            name: product.name ?? "",
            description: product.description ?? "",
            categoryId: product.categoryId ?? product.category?.id ?? "",
            material: product.material ?? "",
            careInstructions: product.careInstructions ?? "",
            gifUrl: product.gifUrl ?? "",
            isAntiTarnish: product.isAntiTarnish ?? false,
            isWaterproof: product.isWaterproof ?? false,
            isSkinFriendly: product.isSkinFriendly ?? false,
            isFeatured: product.isFeatured ?? false,
            isBestSeller: product.isBestSeller ?? false,
            isNewArrival: product.isNewArrival ?? false,
          });
          setImages(
            (product.images ?? []).length > 0
              ? product.images.map((img, i) => ({ imageUrl: img.imageUrl, sortOrder: i }))
              : [{ imageUrl: "", sortOrder: 0 }]
          );
          setVariants(
            (product.variants ?? []).length > 0
              ? product.variants.map((v) => ({
                  sku: v.sku ?? "",
                  color: v.color ?? "",
                  size: v.size ?? "",
                  price: v.price ?? 0,
                  comparePrice: v.comparePrice ?? undefined,
                  stock: v.stock ?? 0,
                }))
              : [{ ...emptyVariant }]
          );
        }
      }
    ).catch(() => {
      showToast({ variant: "error", title: "Failed to load product" });
    }).finally(() => setLoading(false));
  }, [productId]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addImage = () => setImages((prev) => [...prev, { imageUrl: "", sortOrder: prev.length }]);
  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const updateImage = (index, value) =>
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, imageUrl: value } : img)));

  const addVariant = () => setVariants((prev) => [...prev, { ...emptyVariant }]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));
  const updateVariant = (index, field, value) =>
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));

  const isValid = () => {
    return (
      form.name.trim() &&
      form.description.trim().length >= 10 &&
      form.categoryId &&
      form.material.trim() &&
      form.careInstructions.trim() &&
      images.every((img) => img.imageUrl.trim()) &&
      images.length > 0 &&
      variants.every((v) => {
        const hasBasics = v.sku.trim() && v.color.trim() && v.size.trim() && v.price > 0;
        const compareOk = !v.comparePrice || v.comparePrice >= v.price;
        return hasBasics && compareOk;
      }) &&
      variants.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid()) {
      showToast({
        variant: "error",
        title: "Fix the highlighted issues",
        description: "Description needs 10+ characters, and each variant's compare price must be >= its price.",
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      gifUrl: form.gifUrl.trim() ? form.gifUrl.trim() : undefined,
      images: images.map((img, i) => ({ imageUrl: img.imageUrl.trim(), sortOrder: i })),
      variants: variants.map((v) => ({
        sku: v.sku.trim(),
        color: v.color.trim(),
        size: v.size.trim(),
        price: Number(v.price),
        comparePrice: v.comparePrice && v.comparePrice >= v.price ? Number(v.comparePrice) : undefined,
        stock: Number(v.stock),
      })),
    };

    try {
      await updateProduct(productId, payload);
      showToast({ variant: "success", title: "Product updated", description: form.name });
      router.push("/admin/products");
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to update product",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Edit Product</h1>

      <section className="space-y-4 border border-[#E8D8C5] bg-white p-6">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">Basic Info</h2>

        <TextField label="Product Name" value={form.name} onChange={(v) => updateField("name", v)} required />
        <TextArea label="Description" value={form.description} onChange={(v) => updateField("description", v)} required />

        <label className="block">
          <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">Category *</span>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <TextField label="Material" value={form.material} onChange={(v) => updateField("material", v)} required />
        <TextArea label="Care Instructions" value={form.careInstructions} onChange={(v) => updateField("careInstructions", v)} required />
        <TextField label="GIF URL (optional)" value={form.gifUrl} onChange={(v) => updateField("gifUrl", v)} />
      </section>

      <section className="border border-[#E8D8C5] bg-white p-6">
        <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">Attributes</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Checkbox label="Anti-Tarnish" checked={form.isAntiTarnish} onChange={(v) => updateField("isAntiTarnish", v)} />
          <Checkbox label="Waterproof" checked={form.isWaterproof} onChange={(v) => updateField("isWaterproof", v)} />
          <Checkbox label="Skin-Friendly" checked={form.isSkinFriendly} onChange={(v) => updateField("isSkinFriendly", v)} />
          <Checkbox label="Featured" checked={form.isFeatured} onChange={(v) => updateField("isFeatured", v)} />
          <Checkbox label="Bestseller" checked={form.isBestSeller} onChange={(v) => updateField("isBestSeller", v)} />
          <Checkbox label="New Arrival" checked={form.isNewArrival} onChange={(v) => updateField("isNewArrival", v)} />
        </div>
      </section>

      <section className="border border-[#E8D8C5] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">Images</h2>
          <button type="button" onClick={addImage} className="flex items-center gap-1 font-sans text-[10px] uppercase text-[#B08D57] hover:underline">
            <Plus size={12} strokeWidth={1.5} /> Add Image
          </button>
        </div>

        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`Image URL ${i + 1}`}
                value={img.imageUrl}
                onChange={(e) => updateImage(i, e.target.value)}
                className="flex-1 border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
              />
              {images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)} className="text-[#4A4A4A] hover:text-[#B5654F]">
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#E8D8C5] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
            Variants (Color / Size / Price / Stock)
          </h2>
          <button type="button" onClick={addVariant} className="flex items-center gap-1 font-sans text-[10px] uppercase text-[#B08D57] hover:underline">
            <Plus size={12} strokeWidth={1.5} /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border border-[#E8D8C5] p-3 sm:grid-cols-6">
              <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
              <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
              <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
              <input type="number" placeholder="Price" value={v.price || ""} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} className="border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
              <input type="number" placeholder="Compare Price" value={v.comparePrice ?? ""} onChange={(e) => updateVariant(i, "comparePrice", Number(e.target.value))} className="border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
              <div className="flex gap-1">
                <input type="number" placeholder="Stock" value={v.stock || ""} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-xs text-[#2A1E17] outline-none focus:border-[#B08D57]" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F]">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E] disabled:opacity-60"
      >
        {submitting ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Save Changes"}
      </button>
    </form>
  );
}

function TextField({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">{label}{required && " *"}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">{label}{required && " *"}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 font-sans text-xs text-[#2A1E17]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}