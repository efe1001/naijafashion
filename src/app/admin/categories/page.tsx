"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { categories as initialCats } from "@/data/products";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState(initialCats.map(c => ({ ...c })));
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", slug: "", image: "", itemCount: "0" });

  const openAdd = () => { setEditId(null); setForm({ name: "", description: "", slug: "", image: "", itemCount: "0" }); setShowModal(true); };
  const openEdit = (c: typeof cats[0]) => { setEditId(c.id); setForm({ name: c.name, description: c.description, slug: c.slug, image: c.image, itemCount: String(c.itemCount) }); setShowModal(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      setCats(prev => prev.map(c => c.id === editId ? { ...c, ...form, itemCount: Number(form.itemCount) } : c));
    } else {
      setCats(prev => [...prev, { id: form.slug || form.name.toLowerCase().replace(/\s+/g,"-"), ...form, itemCount: Number(form.itemCount) }]);
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{cats.length} categories</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 text-sm shadow-lg shadow-green-200">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cats.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-36 bg-gray-100">
              {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" sizes="400px" />}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">{c.name}</p>
                <p className="text-gray-300 text-xs">{c.itemCount} products</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">/{c.slug}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setCats(prev => prev.filter(x => x.id !== c.id))} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Name *", key: "name", placeholder: "e.g. Nigerian Traditional" },
                { label: "Slug", key: "slug", placeholder: "e.g. nigerian-traditional" },
                { label: "Description", key: "description", placeholder: "Brief description..." },
                { label: "Image URL", key: "image", placeholder: "https://..." },
                { label: "Item Count", key: "itemCount", placeholder: "0" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-xl text-sm">{editId ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
