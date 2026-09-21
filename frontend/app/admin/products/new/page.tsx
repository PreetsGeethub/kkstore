"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { getCategories, createProduct, type ProductFormPayload } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
type Category = { id: string; name: string };

const emptyImage = { imageUrl: "", sortOrder: 0 };
const emptyVariant = { sku: "", color: "", size: "", price: 0, comparePrice: undefined as number | undefined, stock: 0 };

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isValidImageUrl = (url: string) => {
    return /^https:\/\/images\.(unsplash|pexels)\.com\/.+/.test(url) || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  };
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    material: "Stainless Steel",
    careInstructions: "",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: false,
    isSkinFriendly: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
  });

  const [images, setImages] = useState([{ ...emptyImage, sortOrder: 0 }]);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addImage = () => setImages((prev) => [...prev, { imageUrl: "", sortOrder: prev.length }]);
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
  const updateImage = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, imageUrl: value } : img)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...emptyVariant }]);
  const removeVariant = (index: number) => setVariants((prev) => prev.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: keyof typeof emptyVariant, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const isValid = () => {
    return (
      form.name.trim() &&
      form.description.trim().length >= 10 &&
      form.categoryId &&
      images.every((img) => img.imageUrl.trim() && isValidImageUrl(img.imageUrl.trim())) &&
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) {
      showToast({
        variant: "error",
        title: "Fix the highlighted issues",
        description: "Make sure image URLs are direct image links (e.g. images.unsplash.com/photo-...), not page links.",
      });
      return;
    }

    setSubmitting(true);

    const payload: ProductFormPayload = {
        ...form,
        gifUrl: form.gifUrl.trim() ? form.gifUrl.trim() : undefined, // omit entirely if empty
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
      await createProduct(payload);
      showToast({ variant: "success", title: "Product created", description: form.name });
      router.push("/admin/products/new");
      // Reset form
      setForm({
        name: "",
        description: "",
        categoryId: "",
        material: "Stainless Steel",
        careInstructions: "",
        gifUrl: "",
        isAntiTarnish: true,
        isWaterproof: false,
        isSkinFriendly: true,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
      });
      setImages([{ ...emptyImage, sortOrder: 0 }]);
      setVariants([{ ...emptyVariant }]);
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to create product",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Add Product</h1>

      {/* Basic info */}
      <section className="space-y-4 border border-[#E8D8C5] bg-white p-6">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
          Basic Info
        </h2>

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

      {/* Feature flags */}
      <section className="border border-[#E8D8C5] bg-white p-6">
        <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
          Attributes
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Checkbox label="Anti-Tarnish" checked={form.isAntiTarnish} onChange={(v) => updateField("isAntiTarnish", v)} />
          <Checkbox label="Waterproof" checked={form.isWaterproof} onChange={(v) => updateField("isWaterproof", v)} />
          <Checkbox label="Skin-Friendly" checked={form.isSkinFriendly} onChange={(v) => updateField("isSkinFriendly", v)} />
          <Checkbox label="Featured" checked={form.isFeatured} onChange={(v) => updateField("isFeatured", v)} />
          <Checkbox label="Bestseller" checked={form.isBestSeller} onChange={(v) => updateField("isBestSeller", v)} />
          <Checkbox label="New Arrival" checked={form.isNewArrival} onChange={(v) => updateField("isNewArrival", v)} />
        </div>
      </section>

      {/* Images */}
      <section className="border border-[#E8D8C5] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
            Images
          </h2>
          <button type="button" onClick={addImage} className="flex items-center gap-1 font-sans text-[10px] uppercase text-[#B08D57] hover:underline">
            <Plus size={12} strokeWidth={1.5} /> Add Image
          </button>
        </div>

        <div className="space-y-2">
        {images.map((img, i) => (
  <div key={i} className="flex items-center gap-3">
    <ImageUpload
      value={img.imageUrl}
      onChange={(url) => updateImage(i, url)}
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

      {/* Variants */}
      <section className="border border-[#E8D8C5] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#2A1E17]">
  Variants (Color / Size / Price / Stock)
</h2>
<p className="mt-1 font-sans text-[10px] text-[#4A4A4A]">
  Compare Price is optional — if set, it must be equal to or higher than Price (it represents the "original" price before discount).
</p>
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
        {submitting ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Create Product"}
      </button>
    </form>
  );
}

function TextField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
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

function TextArea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 font-sans text-xs text-[#2A1E17]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}