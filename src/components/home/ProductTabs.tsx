"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shirt, ShoppingBag, Crown, Watch } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

const TABS = [
  { id: "men", label: "Men's Wear", icon: Shirt, href: "/category/men" },
  { id: "women", label: "Women's Wear", icon: ShoppingBag, href: "/category/women" },
  { id: "nigerian-traditional", label: "Traditional", icon: Crown, href: "/category/nigerian-traditional" },
  { id: "accessories", label: "Accessories", icon: Watch, href: "/category/accessories" },
];

export default function ProductTabs({ products }: { products: Product[] }) {
  const [active, setActive] = useState("men");
  const filtered = products.filter(p => p.category === active).slice(0, 8);
  const activeTab = TABS.find(t => t.id === active)!;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div>
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">Browse by Style</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Shop by Category</h2>
          </div>
          <Link href={activeTab.href} className="hidden sm:flex items-center gap-1 text-green-700 font-semibold text-sm hover:text-green-800 group">
            See All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                active === id ? "text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}>
              {active === id && (
                <motion.span layoutId="tab-bg" className="absolute inset-0 bg-green-700 rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              <span className="relative flex items-center gap-2">
                <Icon size={15} /> {label}
              </span>
            </button>
          ))}
        </div>

        {/* Products */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.length > 0
              ? filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))
              : <div className="col-span-4 text-center py-16 text-gray-400">No products in this category yet.</div>
            }
          </motion.div>
        </AnimatePresence>

        <motion.div className="text-center mt-8"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link href={activeTab.href}
            className="group inline-flex items-center gap-2 border-2 border-green-700 text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-700 hover:text-white transition-all">
            View All {activeTab.label}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
