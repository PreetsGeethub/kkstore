"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
type Category = { id: string; name: string; image: string };

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) return;

    setSaving(true);
    try {
      await createCategory({ name: name.trim(), image: image.trim() });
      showToast({ variant: "success", title: "Category created" });
      setName("");
      setImage("");
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to create category",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditImage(cat.image);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditImage("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editImage.trim()) return;

    setEditSaving(true);
    try {
      await updateCategory(id, { name: editName.trim(), image: editImage.trim() });
      showToast({ variant: "success", title: "Category updated" });
      cancelEdit();
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to update category",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
      showToast({ variant: "info", title: "Category deleted" });
      load();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Failed to delete category",
        description: error instanceof Error ? error.message : "It may still have products linked to it.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-[var(--font-playfair)] text-2xl text-[#2A1E17]">Categories</h1>

      <form onSubmit={handleAdd} className="mb-8 flex gap-3 border border-[#E8D8C5] bg-white p-5">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
        />
      <ImageUpload value={image} onChange={setImage} onRemove={() => setImage("")} />

        <button
          type="submit"
          disabled={saving}
          className="flex shrink-0 items-center gap-2 bg-[#B08D57] px-4 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] hover:bg-[#C9A96E] disabled:opacity-60"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add
        </button>
      </form>

      {loading ? (
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-[#E8D8C5] bg-white p-3">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-[#E8D8C5] bg-[#FAF7F2] px-2 py-1.5 font-sans text-sm text-[#2A1E17] outline-none focus:border-[#B08D57]"
                  />
               <ImageUpload value={editImage} onChange={setEditImage} onRemove={() => setEditImage("")} />
                  <button
                    onClick={() => saveEdit(cat.id)}
                    disabled={editSaving}
                    aria-label="Save"
                    className="shrink-0 text-[#7A9B76] hover:text-[#5f7d5c] disabled:opacity-50"
                  >
                    <Check size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    aria-label="Cancel"
                    className="shrink-0 text-[#4A4A4A] hover:text-[#2A1E17]"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={cat.image} alt={cat.name} className="h-10 w-10 shrink-0 object-cover" />
                  <span className="font-sans text-sm text-[#2A1E17]">{cat.name}</span>
                  <span className="ml-auto truncate font-sans text-[10px] text-[#4A4A4A]">{cat.id}</span>
                  <button
                    onClick={() => startEdit(cat)}
                    aria-label="Edit category"
                    className="shrink-0 text-[#4A4A4A] hover:text-[#B08D57]"
                  >
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    aria-label="Delete category"
                    className="shrink-0 text-[#4A4A4A] hover:text-[#B5654F] disabled:opacity-50"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}