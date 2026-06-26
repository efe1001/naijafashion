import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TruckIcon, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const featuredProducts = products.slice(0, 8);
const newArrivals = products.filter((p) => p.badge === "New").slice(0, 4);
const nigerianPicks = products.filter((p) => p.origin === "nigerian").slice(0, 4);

const features = [
  { icon: TruckIcon, title: "Free Delivery", desc: "On orders above ₦50,000" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% secured via Paystack" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer care" },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-gray-900">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-800/50 border border-green-700/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-sm font-medium">New Collection — 2025</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
                Dress the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  Nigerian
                </span>{" "}
                Way
              </h1>
              <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-lg">
                From Royal Agbada to Ankara prints, Aso-oke to international couture — discover
                fashion that speaks your identity. Delivered to your doorstep across Nigeria.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/category/nigerian-traditional"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition-all"
                >
                  Nigerian Wear
                </Link>
              </div>
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                {[["10,000+", "Products"], ["50,000+", "Customers"], ["4.8★", "Rating"]].map(
                  ([value, label]) => (
                    <div key={label}>
                      <p className="text-2xl font-extrabold text-white">{value}</p>
                      <p className="text-sm text-gray-400">{label}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=400&q=80",
                "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&q=80",
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
                "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80",
              ].map((src, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl overflow-hidden ${i === 0 || i === 3 ? "mt-6" : "-mt-6"}`}
                >
                  <div className="aspect-[3/4] relative">
                    <Image src={src} alt="Fashion" fill className="object-cover" sizes="200px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5 hover:bg-green-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">Browse by Category</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Shop Collections</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold text-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-300">
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="16vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{cat.name}</p>
                  <p className="text-gray-300 text-xs mt-0.5">{cat.itemCount} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nigerian Picks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">🇳🇬 Made for Nigeria</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Nigerian Bestsellers</h2>
            </div>
            <Link href="/category/nigerian-traditional" className="hidden sm:flex items-center gap-1 text-green-700 font-semibold text-sm">
              See All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {nigerianPicks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-800 to-green-600 p-10 sm:p-16">
            <div className="relative max-w-xl">
              <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Limited Time Offer
              </span>
              <h2 className="text-4xl font-extrabold text-white mt-4 leading-tight">
                Up to 40% off on Ankara &amp; Lace
              </h2>
              <p className="text-green-100 mt-3 text-lg">
                Grab exclusive deals on our most-loved Nigerian wear. Sale ends soon!
              </p>
              <Link
                href="/products?filter=sale"
                className="mt-6 inline-flex items-center gap-2 bg-white text-green-800 font-bold px-7 py-3.5 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
              >
                Shop the Sale <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">Trending Now</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-green-700 font-semibold text-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/products" className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-700 hover:text-white transition-all">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">Just Landed</p>
            <h2 className="text-3xl font-extrabold text-gray-900">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-1">Customer Love</p>
            <h2 className="text-3xl font-extrabold text-gray-900">What Nigerians Are Saying</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Adaeze Okonkwo", location: "Lagos", avatar: "AO",
                text: "I ordered a George wrapper set for my sister's wedding and it arrived the next day! The quality is amazing. NaijaFashion is now my go-to for all things fashion.",
              },
              {
                name: "Emeka Nwosu", location: "Abuja", avatar: "EN",
                text: "Finally found a place with genuine Aso-oke at reasonable prices. My Agbada for my son's naming ceremony turned heads. Customer service was also top notch!",
              },
              {
                name: "Fatima Bello", location: "Kano", avatar: "FB",
                text: "The Babban Riga I ordered for sallah was exactly as described. Beautiful embroidery, fast delivery, and the packaging was lovely. Will definitely order again!",
              },
            ].map((r) => (
              <div key={r.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex text-yellow-400 gap-0.5 mb-4 text-lg">★★★★★</div>
                <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.location}, Nigeria</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
