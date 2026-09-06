"use client";

const items = [
  "🇳🇬 Nigerian Traditional Wear",
  "👔 Men's Corporate Suits",
  "👗 Women's Ankara Styles",
  "👶 Kids' Fashion",
  "💍 Premium Accessories",
  "🌍 International Couture",
  "🔥 Flash Deals Daily",
  "🚚 Fast Delivery Nationwide",
  "✅ 100% Authentic Products",
  "💳 Secure Monnify Payments",
];

export default function MarqueeStrip() {
  const doubled = [...items, ...items];
  return (
    <div className="bg-green-700 py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-white text-sm font-medium">
            {item}
            <span className="text-green-400">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
