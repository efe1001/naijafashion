"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Star, Filter, X } from "lucide-react";
import { products as initialProducts } from "@/data/products";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

const CATEGORIES = ["All", "nigerian-traditional", "women", "men", "kids", "accessories", "international"];

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", price: "", originalPrice: "", category: "men", subcategory: "",
    description: "", sizes: "", colors: "", material: "", origin: "nigerian" as "nigerian" | "international",
    badge: "" as "" | "New" | "Sale" | "Hot" | "Limited",
  });

  const filtered = useMemo(() => {
    return productList.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [productList, search, categoryFilter]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", price: "", originalPrice: "", category: "men", subcategory: "", description: "", sizes: "", colors: "", material: "", origin: "nigerian", badge: "" });
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
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    const payload: Partial<Product> = {
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
    };

    if (editProduct) {
      setProductList(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...payload } : p));
    } else {
      const newProduct: Product = {
        id: `prd-${Date.now()}`,
        images: ["https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80"],
        inStock: true,
        rating: 0,
        reviewCount: 0,
        ...payload,
      } as Product;
      setProductList(prev => [newProduct, ...prev]);
    }
    setShowModal(false);
  };

  const toggleStock = (id: string) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const deleteProduct = (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {productList.length} products</p>
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
                        {p.badge && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">{p.badge}</span>
                        )}
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
                    <button onClick={() => toggleStock(p.id)} className="flex items-center gap-1.5 group">
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
              <button onClick={handleSave} className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors text-sm">
                {editProduct ? "Save Changes" : "Add Product"}
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
