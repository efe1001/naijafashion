import Link from "next/link";
import { Globe, Share2, MessageSquare, Play, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-xl">Get exclusive deals & style alerts</h3>
              <p className="text-green-200 text-sm mt-1">
                Join 50,000+ Nigerians staying ahead of the trend
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-green-200 focus:outline-none focus:bg-white/20 text-sm"
              />
              <button className="bg-white text-green-800 font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">iF</span>
              </div>
              <span className="text-white font-extrabold text-xl">
                i<span className="text-green-400">Fashion</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nigeria&apos;s premier fashion destination. Celebrating African elegance with a global
              touch — from Ankara to designer wear.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://t.me/wavezads" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-[#229ED9] rounded-full flex items-center justify-center transition-colors"
                title="Telegram @wavezads">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              {[Globe, Share2, MessageSquare, Play].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Nigerian Traditional", "/category/nigerian-traditional"],
                ["Women&apos;s Fashion", "/category/women"],
                ["Men&apos;s Fashion", "/category/men"],
                ["Kids&apos; Wear", "/category/kids"],
                ["Accessories", "/category/accessories"],
                ["International Wear", "/category/international"],
                ["New Arrivals", "/products?filter=new"],
                ["Sale", "/products?filter=sale"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-green-400 transition-colors"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help & Info</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Track My Order", "/track"],
                ["Returns & Exchanges", "/returns"],
                ["Size Guide", "/size-guide"],
                ["FAQ", "/faq"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-400">
                  15 Bode Thomas Street, Surulere, Lagos, Nigeria
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={16} className="text-green-500 shrink-0" />
                <a href="tel:+2348012345678" className="hover:text-green-400 transition-colors">
                  +234 801 234 5678
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={16} className="text-green-500 shrink-0" />
                <a
                  href="mailto:hello@ifashion.ng"
                  className="hover:text-green-400 transition-colors"
                >
                  hello@ifashion.ng
                </a>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Customer Support Hours</p>
              <p className="text-xs text-gray-300 mt-1">Mon – Sat: 8am – 8pm</p>
              <p className="text-xs text-gray-300">Sunday: 10am – 5pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} iFashion. All rights reserved. Made with ❤️ in
              Nigeria.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Secured payments via</span>
              <div className="flex gap-2 items-center">
                <div className="bg-[#0055d4] text-xs text-white px-2.5 py-1 rounded font-bold">
                  Monnify
                </div>
                <div className="bg-gray-700 text-xs text-white px-2.5 py-1 rounded font-bold">
                  Visa
                </div>
                <div className="bg-gray-700 text-xs text-white px-2.5 py-1 rounded font-bold">
                  Mastercard
                </div>
                <div className="bg-gray-700 text-xs text-white px-2.5 py-1 rounded font-bold">
                  USSD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
