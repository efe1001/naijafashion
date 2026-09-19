"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { useCategories, CategoryItem } from "@/lib/useCategories";
import { uploadFileToR2 } from "@/lib/upload";

const EMPTY = { name: "", slug: "", description: "", image: "" };

export default function AdminCategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description, image: c.image });
    setError("");
    setShowModal(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be under 10MB.");
    setError("");
    setUploading(true);
    try {
      const url = await uploadFileToR2(file, "uploads");
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Category name is required");
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save category");
      await refetch();
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: CategoryItem) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    setPageError("");
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setPageError(data.error || "Could not delete category");
    refetch();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories · shown on the storefront</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {pageError && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{pageError}</p>}
      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" sizes="33vw" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">/{c.slug}</p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-full whitespace-nowrap">{c.itemCount} live items</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.description}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => remove(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="relative h-36 rounded-xl bg-gray-100 overflow-hidden mb-2">
                  {form.image && <Image src={form.image} alt="" fill className="object-cover" sizes="400px" />}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 disabled:opacity-60"
                >
                  <Upload size={15} /> {uploading ? "Uploading..." : form.image ? "Replace image" : "Upload image"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from the name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 text-sm disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
