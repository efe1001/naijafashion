"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, TruckIcon, ShieldCheck, RefreshCw, Headphones,
  Star, BadgeCheck, Flame, Sparkles, Crown, Zap, Heart,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/home/HeroSlider";
import FlashSaleTimer from "@/components/home/FlashSaleTimer";
import ProductTabs from "@/components/home/ProductTabs";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import { products, categories } from "@/data/products";

const nigerianPicks = [
  ...products.filter(p => p.category === "men"),
  ...products.filter(p => p.category === "nigerian-traditional" && ["agbada","senator","babban-riga"].includes(p.subcategory)),
].slice(0, 12);

const newArrivals = products.filter(p => p.badge === "New").slice(0, 4);
const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);

const features = [
  { icon: TruckIcon, title: "Free Delivery", desc: "On orders above ₦50,000", color: "text-blue-500", bg: "bg-blue-50 group-hover:bg-blue-500" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% secured via Monnify", color: "text-green-500", bg: "bg-green-50 group-hover:bg-green-500" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free returns", color: "text-purple-500", bg: "bg-purple-50 group-hover:bg-purple-500" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer care", color: "text-orange-500", bg: "bg-orange-50 group-hover:bg-orange-500" },
];

const testimonials = [
  { name: "Adaeze Okonkwo", location: "Lagos", avatar: "AO", avatarBg: "bg-green-600", rating: 5, verified: true, text: "I ordered a George wrapper set for my sister's wedding and it arrived the next day! The quality is amazing. iFashion is my go-to!", product: "George Wrapper Set" },
  { name: "Emeka Nwosu", location: "Abuja", avatar: "EN", avatarBg: "bg-blue-600", rating: 5, verified: true, text: "Finally found genuine Aso-oke at reasonable prices. My Agbada for my son's naming ceremony turned heads!", product: "Royal Agbada Set" },
  { name: "Fatima Bello", location: "Kano", avatar: "FB", avatarBg: "bg-purple-600", rating: 5, verified: true, text: "The Babban Riga for sallah was exactly as described. Beautiful embroidery, fast delivery, lovely packaging!", product: "Hausa Babban Riga" },
  { name: "Chinyere Eze", location: "Enugu", avatar: "CE", avatarBg: "bg-pink-600", rating: 5, verified: false, text: "Their women's section is fire! Got three Ankara dresses and every one fits perfectly. 5 stars, absolutely recommend!", product: "Ankara Maxi Dress" },
  { name: "Ibrahim Danladi", location: "Kaduna", avatar: "ID", avatarBg: "bg-yellow-700", rating: 4, verified: true, text: "Senator Kaftan Suit was exactly what I needed. Good quality fabric, stitching is clean. Would order again!", product: "Senator Kaftan Suit" },
  { name: "Ngozi Obi", location: "Port Harcourt", avatar: "NO", avatarBg: "bg-red-600", rating: 5, verified: true, text: "I've ordered 5 times now and they never disappoint. The accessories section is my favourite!", product: "Premium Accessories" },
];

const lookbook = [
  { src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&q=80", label: "Men's Formal", tag: "Shop Now", href: "/category/men", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80", label: "Women's Style", tag: "Explore", href: "/category/women", span: "" },
  { src: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80", label: "Street Wear", tag: "View", href: "/category/men", span: "" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80", label: "Traditional Wear", tag: "Discover", href: "/category/nigerian-traditional", span: "col-span-2" },
];

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  return (
    <div className="bg-white overflow-x-hidden">

      <HeroSlider />
      <MarqueeStrip />

      {/* Features */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={fadeUp}
                className="group flex items-center gap-4 px-6 py-6 hover:bg-gray-50 transition-colors cursor-default">
                <div className={`w-12 h-12 ${bg} transition-colors duration-300 rounded-2xl flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={`${color} group-hover:text-white transition-colors duration-300`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSaleTimer />

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex items-end justify-between mb-8"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Crown size={13} /> Explore Collections
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold text-sm group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {categories.map((cat, i) => (
              <motion.div key={cat.id} variants={fadeUp} custom={i}>
                <Link href={`/category/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="16vw" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-green-900/80 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{cat.name}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{cat.itemCount} items</p>
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 bg-white/0 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <ArrowRight size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Picks for Men */}
      <section className="py-16 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex items-end justify-between mb-8"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Flame size={14} className="text-orange-500 animate-bounce-soft" /> 🇳🇬 Men&apos;s Nigerian Wear
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">Top Picks for Men</h2>
            </div>
            <Link href="/category/men" className="hidden sm:flex items-center gap-1 text-green-700 font-semibold text-sm hover:text-green-800 group">
              See All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {nigerianPicks.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} custom={i}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex items-end justify-between mb-8"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div>
              <p className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles size={13} className="animate-pulse" /> Style Lookbook
              </p>
              <h2 className="text-3xl font-extrabold text-white">Dress to Impress</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-green-400 font-semibold text-sm hover:text-green-300 group">
              Shop All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 h-125 sm:h-150">
            {lookbook.map(({ src, label, tag, href, span }, i) => (
              <motion.div key={label} className={span}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link href={href} className="group relative rounded-2xl overflow-hidden w-full h-full flex hover:shadow-2xl block">
                  <Image src={src} alt={label} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="50vw" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-green-900/70 transition-colors duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-white font-extrabold text-lg drop-shadow-lg">{label}</p>
                      <motion.span initial={{ width: 0 }} whileHover={{ width: "100%" }}
                        className="block h-0.5 bg-green-400 mt-1 transition-all" />
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                      {tag} <ArrowRight size={12} />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <ProductTabs products={products} />

      {/* Best Sellers + New Arrivals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Best Sellers */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Flame size={13} fill="currentColor" className="animate-bounce-soft" /> Bestsellers
                  </p>
                  <h2 className="text-2xl font-extrabold text-gray-900">Most Popular</h2>
                </div>
                <Link href="/products" className="text-green-700 font-semibold text-sm hover:text-green-800 flex items-center gap-1 group">
                  See All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="space-y-3">
                {bestSellers.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Link href={`/product/${p.id}`}
                      className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group bg-white card-hover">
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="80px" />
                        <div className="absolute top-1 left-1 bg-gray-900/90 text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-green-700 transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.category.replace(/-/g," ")}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={10} fill={j < Math.floor(p.rating) ? "#f59e0b" : "none"} className={j < Math.floor(p.rating) ? "text-yellow-400" : "text-gray-200"} />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">({p.reviewCount})</span>
                        </div>
                        <p className="font-extrabold text-green-700 mt-1.5 text-sm">₦{p.price.toLocaleString()}</p>
                      </div>
                      <div className="self-center">
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-green-700 group-hover:border-green-700 transition-colors">
                          <ArrowRight size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* New Arrivals */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="animate-pulse" /> Just Landed
                  </p>
                  <h2 className="text-2xl font-extrabold text-gray-900">New Arrivals</h2>
                </div>
                <Link href="/products?filter=new" className="text-green-700 font-semibold text-sm hover:text-green-800 flex items-center gap-1 group">
                  See All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {newArrivals.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-4">
          {[
            { src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80", tag: "Men's Collection", title: "Suits & Native Wear", sub: "From boardroom to owambe", href: "/category/men", overlay: "from-gray-900/90", accent: "text-green-400" },
            { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", tag: "Women's Collection", title: "Ankara & Couture", sub: "Fashion that tells your story", href: "/category/women", overlay: "from-purple-900/90", accent: "text-pink-400" },
          ].map(({ src, tag, title, sub, href, overlay, accent }) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden h-60 group card-hover">
              <Image src={src} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
              <div className={`absolute inset-0 bg-linear-to-r ${overlay} to-transparent`} />
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <p className={`${accent} text-xs font-bold uppercase tracking-widest mb-1`}>{tag}</p>
                <h3 className="text-white font-extrabold text-2xl">{title}</h3>
                <p className="text-gray-300 text-sm mt-1">{sub}</p>
                <Link href={href}
                  className="mt-4 inline-flex items-center gap-1.5 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl w-fit hover:bg-gray-100 transition-colors group/btn">
                  Shop Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center">
              <Heart size={13} fill="currentColor" className="text-red-500" /> Customer Love
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">What Nigerians Are Saying</h2>
            <p className="text-gray-500 mt-2 text-sm">Join 50,000+ happy customers across Nigeria</p>
          </motion.div>

          {/* Rating summary */}
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="text-center">
              <p className="text-6xl font-extrabold text-gray-900">4.8</p>
              <div className="flex justify-center gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="#f59e0b" className="text-yellow-400" />)}
              </div>
              <p className="text-xs text-gray-500 font-medium">Average Rating</p>
            </div>
            <div className="w-px h-16 bg-gray-200 hidden sm:block" />
            <div className="space-y-1.5 flex-1 w-full">
              {[["5 ★", 82, "bg-yellow-400"], ["4 ★", 12, "bg-yellow-300"], ["3 ★", 4, "bg-gray-300"], ["2 ★", 1, "bg-gray-200"], ["1 ★", 1, "bg-gray-100"]].map(([label, pct, bar]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${bar} rounded-full`} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {testimonials.map(r => (
              <motion.div key={r.name} variants={fadeUp}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "#f59e0b" : "none"} className={i < r.rating ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                      <BadgeCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                  <Zap size={10} /> Purchased: {r.product}
                </p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                  <div className={`w-10 h-10 ${r.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-xs`}>{r.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.location}, Nigeria</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Telegram CTA */}
      <motion.section className="py-12 bg-linear-to-r from-gray-950 via-[#1a2a3a] to-gray-950"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                className="w-16 h-16 bg-[#229ED9] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </motion.div>
              <div>
                <h3 className="text-white font-extrabold text-xl">Join Our Telegram Channel</h3>
                <p className="text-gray-400 text-sm mt-0.5">Exclusive deals, new arrivals & style tips daily</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">2,500+ members online</span>
                </div>
              </div>
            </div>
            <motion.a href="https://t.me/wavezads" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-xl whitespace-nowrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Join @wavezads
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section className="py-14 bg-green-800 relative overflow-hidden"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-600/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-float-reverse" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-2">Newsletter</p>
          <h2 className="text-3xl font-extrabold text-white mb-3">Stay Ahead of the Trend</h2>
          <p className="text-green-200 text-sm mb-6">Join 50,000+ Nigerians getting exclusive deals and style alerts every week.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-green-300 focus:outline-none focus:bg-white/20 focus:border-white/40 text-sm transition-colors" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="bg-white text-green-800 font-bold px-6 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-sm whitespace-nowrap shadow-lg">
              Subscribe
            </motion.button>
          </div>
          <p className="text-green-400 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </motion.section>

    </div>
  );
}
