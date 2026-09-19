"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Star, Filter, X, Video as VideoIcon, Upload } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { uploadFileToR2 } from "@/lib/upload";
import { useProducts } from "@/lib/useProducts";

const CATEGORIES = ["All", "nigerian-traditional", "women", "men", "kids", "accessories", "international"];

export default function AdminProductsPage() {
  const { products, refetch } = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formVideos, setFormVideos] = useState<string[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const formImageRef = useRef<HTMLInputElement>(null);
  const formVideoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", price: "", originalPrice: "", category: "men", subcategory: "",
    description: "", sizes: "", colors: "", material: "", origin: "nigerian" as "nigerian" | "international",
    badge: "" as "" | "New" | "Sale" | "Hot" | "Limited",
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", price: "", originalPrice: "", category: "men", subcategory: "", description: "", sizes: "", colors: "", material: "", origin: "nigerian", badge: "" });
    setFormImages([]);
    setFormVideos([]);
    setMediaError("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice || ""),
      category: p.category, subcategory: p.subcategory, description: p.description,
      sizes: p.sizes.join(", "), colors: p.colors.join(", "), material: p.material || "",
      origin: p.origin, badge: p.badge || "",
    });
    setFormImages(p.images);
    setFormVideos(p.videos ?? []);
    setMediaError("");
    setShowModal(true);
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (formImageRef.current) formImageRef.current.value = "";
    if (files.length === 0) return;
    const bad = files.find(f => !f.type.startsWith("image/"));
    if (bad) { setMediaError("Please select image files only."); return; }
    if (files.some(f => f.size > 10 * 1024 * 1024)) { setMediaError("Each image must be under 10MB."); return; }
    setMediaError("");
    setMediaUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadFileToR2(f, "products")));
      setFormImages(prev => [...prev, ...urls]);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setMediaUploading(false);
    }
  };

  const handleFormVideoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (formVideoRef.current) formVideoRef.current.value = "";
    if (files.length === 0) return;
    if (files.some(f => !f.type.startsWith("video/"))) { setMediaError("Please select video files only."); return; }
    if (files.some(f => f.size > 100 * 1024 * 1024)) { setMediaError("Each video must be under 100MB."); return; }
    setMediaError("");
    setMediaUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadFileToR2(f, "products")));
      setFormVideos(prev => [...prev, ...urls]);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setMediaUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      subcategory: form.subcategory,
      description: form.description,
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      material: form.material,
      origin: form.origin,
      badge: form.badge || undefined,
      ...(formImages.length > 0 ? { images: formImages } : {}),
      videos: formVideos,
    };

    setSaving(true);
    try {
      if (editProduct) {
        await fetch(`/api/products/${editProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await refetch();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStock = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !p.inStock }),
    });
    refetch();
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    refetch();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {products.length} products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200 text-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${categoryFilter === cat ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat === "All" ? "All" : cat.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.id}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.badge && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">{p.badge}</span>
                          )}
                          {(p.videos?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                              <VideoIcon size={10} /> {p.videos?.length} Video{(p.videos?.length ?? 0) > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium capitalize">
                      {p.category.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900">{formatPrice(p.price)}</p>
                    {p.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-700">{p.rating}</span>
                      <span className="text-gray-400 text-xs">({p.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <button onClick={() => toggleStock(p)} className="flex items-center gap-1.5 group">
                      {p.inStock
                        ? <ToggleRight size={20} className="text-green-500" />
                        : <ToggleLeft size={20} className="text-gray-400" />}
                      <span className={`text-xs font-medium ${p.inStock ? "text-green-600" : "text-gray-400"}`}>
                        {p.inStock ? "In Stock" : "Out"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.origin === "nigerian" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                      {p.origin === "nigerian" ? "🇳🇬" : "🌍"} {p.origin}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editProduct ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <div className="flex flex-wrap gap-2">
                  {formImages.map((url, i) => (
                    <div key={url} className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 ? (
                        <span className="absolute bottom-0 inset-x-0 bg-green-700 text-white text-[10px] text-center py-0.5 font-semibold">Thumbnail</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFormImages(prev => [prev[i], ...prev.filter((_, idx) => idx !== i)])}
                          className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5 hover:bg-green-700"
                        >
                          Make thumbnail
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => formImageRef.current?.click()}
                    disabled={mediaUploading}
                    className="w-20 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-60"
                  >
                    {mediaUploading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <><Upload size={16} /> Add</>}
                  </button>
                </div>
                <input ref={formImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />
                <p className="text-xs text-gray-400 mt-1">The thumbnail is shown in listings. Tap &quot;Make thumbnail&quot; on any image to change it. Up to 10MB each.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Videos</label>
                {formVideos.map((url, i) => (
                  <div key={url} className="relative rounded-xl overflow-hidden bg-black aspect-video mb-2">
                    <video src={url} controls className="w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setFormVideos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                      title="Remove video"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => formVideoRef.current?.click()}
                  disabled={mediaUploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-60"
                >
                  <VideoIcon size={15} /> {formVideos.length > 0 ? "Add More Videos" : "Upload Videos"}
                </button>
                <input ref={formVideoRef} type="file" accept="video/*" multiple className="hidden" onChange={handleFormVideoFiles} />
                <p className="text-xs text-gray-400 mt-1">Optional. Select one or several. Keep each under 100MB.</p>
              </div>
              {mediaError && <p className="text-red-500 text-xs">{mediaError}</p>}

              {[
                { label: "Product Name *", key: "name", type: "text", placeholder: "e.g. Royal Agbada Set" },
                { label: "Price (₦) *", key: "price", type: "number", placeholder: "45000" },
                { label: "Original Price (₦)", key: "originalPrice", type: "number", placeholder: "55000 (optional)" },
                { label: "Subcategory", key: "subcategory", type: "text", placeholder: "e.g. agbada, shirts, dresses" },
                { label: "Material", key: "material", type: "text", placeholder: "e.g. Aso-oke, Cotton" },
                { label: "Sizes (comma separated)", key: "sizes", type: "text", placeholder: "S, M, L, XL, XXL" },
                { label: "Colors (comma separated)", key: "colors", type: "text", placeholder: "White, Gold, Blue" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {["nigerian-traditional","women","men","kids","accessories","international"].map(c => (
                      <option key={c} value={c}>{c.replace(/-/g," ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <select value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value as "nigerian" | "international" }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="nigerian">🇳🇬 Nigerian</option>
                    <option value="international">🌍 International</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value as typeof form.badge }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Hot">Hot</option>
                  <option value="Sale">Sale</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Product description..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || mediaUploading} className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors text-sm disabled:opacity-60">
                {saving ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Product?</h3>
              <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={() => deleteProduct(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
