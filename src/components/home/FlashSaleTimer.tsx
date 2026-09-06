"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Clock, Tag } from "lucide-react";

function getTimeLeft() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 sm:w-20 h-16 sm:h-20 perspective-500">
        <AnimatePresence mode="wait">
          <motion.div key={display}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-extrabold text-3xl sm:text-4xl tabular-nums">{display}</span>
          </motion.div>
        </AnimatePresence>
        {/* Fold line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10 pointer-events-none" />
      </div>
      <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function FlashSaleTimer() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft());
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative py-14 overflow-hidden bg-linear-to-r from-gray-950 via-red-950 to-gray-950">
      {/* Animated background */}
      <div className="absolute inset-0 bg-linear-to-r from-red-900/20 via-orange-800/30 to-red-900/20 animate-gradient-x" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-float-reverse" />

      {/* Diagonal stripes */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left */}
          <motion.div className="text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3 animate-pulse">
              <Zap size={12} fill="currentColor" /> FLASH SALE — TODAY ONLY
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">Up to <span className="text-red-400">40% Off</span></h2>
            <p className="text-gray-400 mt-2 text-lg">Men&apos;s Agbada, Senator Suits, George Wrappers & More</p>
            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center lg:justify-start">
              {["Free Delivery", "Easy Returns", "Verified Items"].map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Clock size={18} className="text-gray-500 hidden sm:block" />
            <FlipUnit value={time.h} label="Hours" />
            <span className="text-white/40 font-extrabold text-3xl pb-5">:</span>
            <FlipUnit value={time.m} label="Mins" />
            <span className="text-white/40 font-extrabold text-3xl pb-5">:</span>
            <FlipUnit value={time.s} label="Secs" />
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Link href="/products?filter=sale"
              className="group inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-red-900/50 hover:shadow-red-500/30 hover:-translate-y-1 text-lg whitespace-nowrap animate-glow-pulse">
              Shop Sale Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
