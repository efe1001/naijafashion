"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Star, Zap } from "lucide-react";

const slides = [
  {
    badge: "🇳🇬 New Collection — 2025",
    title: "Dress the",
    accent: "Nigerian",
    subtitle: "Way",
    desc: "From Royal Agbada to Ankara prints — discover fashion that speaks your identity. Delivered across Nigeria.",
    cta: { label: "Shop Now", href: "/products" },
    sub: { label: "Nigerian Wear", href: "/category/nigerian-traditional" },
    bg: "from-green-950 via-green-900 to-gray-950",
    accentColor: "from-green-400 to-emerald-300",
    orb1: "bg-green-500/20",
    orb2: "bg-emerald-400/15",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80",
    ],
    stats: [{ value: "10k+", label: "Products", icon: ShoppingBag }, { value: "50k+", label: "Customers", icon: Star }, { value: "4.8★", label: "Rating", icon: Zap }],
  },
  {
    badge: "✨ Women's Collection",
    title: "Style Meets",
    accent: "Elegance",
    subtitle: "& Grace",
    desc: "Curated women's fashion from Ankara to international couture. Express yourself with iFashion.",
    cta: { label: "Shop Women", href: "/category/women" },
    sub: { label: "New Arrivals", href: "/products?filter=new" },
    bg: "from-purple-950 via-fuchsia-900 to-gray-950",
    accentColor: "from-fuchsia-400 to-pink-300",
    orb1: "bg-fuchsia-500/20",
    orb2: "bg-pink-400/15",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
    ],
    stats: [{ value: "500+", label: "Dresses", icon: ShoppingBag }, { value: "200+", label: "Styles", icon: Star }, { value: "Free", label: "Returns", icon: Zap }],
  },
  {
    badge: "🔥 Flash Sale — Up to 40% Off",
    title: "Unbeatable",
    accent: "Deals",
    subtitle: "on Premium Wear",
    desc: "Limited-time discounts on Agbada, Senator suits, George wrappers & more. Sale ends soon!",
    cta: { label: "Shop the Sale", href: "/products?filter=sale" },
    sub: { label: "View All Deals", href: "/products" },
    bg: "from-red-950 via-orange-900 to-gray-950",
    accentColor: "from-orange-400 to-red-300",
    orb1: "bg-orange-500/20",
    orb2: "bg-red-400/15",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400&q=80",
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80",
    ],
    stats: [{ value: "40%", label: "Max Off", icon: Zap }, { value: "200+", label: "Sale Items", icon: ShoppingBag }, { value: "Today", label: "Only", icon: Star }],
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx: number, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = () => go((current - 1 + slides.length) % slides.length, -1);
  const next = useCallback(() => go((current + 1) % slides.length, 1), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const s = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className={`relative h-[78vh] min-h-140 flex items-center overflow-hidden bg-linear-to-br ${s.bg} transition-all duration-700`}>

      {/* Animated background orbs */}
      <div className={`absolute top-20 left-10 w-72 h-72 ${s.orb1} rounded-full blur-3xl animate-float-slow`} />
      <div className={`absolute bottom-20 right-10 w-96 h-96 ${s.orb2} rounded-full blur-3xl animate-float-reverse`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full blur-3xl" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      {/* Floating decorative rings */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-white/10 rounded-full animate-spin-slow" />
      <div className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-white/10 rounded-full animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "8s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Text content with AnimatePresence */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={current} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>

              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">{s.badge}</span>
              </motion.div>

              <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {s.title}{" "}
                <span className={`text-transparent bg-clip-text bg-linear-to-r ${s.accentColor} animate-gradient-x`}>
                  {s.accent}
                </span>{" "}
                {s.subtitle}
              </motion.h1>

              <motion.p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-lg"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {s.desc}
              </motion.p>

              <motion.div className="flex flex-wrap gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Link href={s.cta.href}
                  className="group inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5">
                  {s.cta.label}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href={s.sub.href}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                  {s.sub.label}
                </Link>
              </motion.div>

              <motion.div className="flex gap-6 mt-10 pt-8 border-t border-white/10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {s.stats.map(({ value, label, icon: Icon }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={13} className="text-white/50" />
                      <p className="text-2xl font-extrabold text-white">{value}</p>
                    </div>
                    <p className="text-sm text-gray-400">{label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Images grid */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={`img-${current}`} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:grid grid-cols-2 gap-3 items-start">
              {s.images.map((src, i) => (
                <motion.div key={src} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  className={`relative rounded-2xl overflow-hidden shadow-2xl ${i === 1 || i === 2 ? "mt-6" : "mt-0"}`}
                  whileHover={{ scale: 1.03, rotate: i % 2 === 0 ? 1 : -1 }}>
                  <div className="h-44 relative">
                    <Image src={src} alt="Fashion" fill className="object-cover" sizes="200px" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm hover:scale-110 z-10">
        <ChevronLeft size={22} />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm hover:scale-110 z-10">
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i, i > current ? 1 : -1)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`} />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 text-white/40 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
