import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

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
                <span className="text-white font-bold text-sm">NF</span>
              </div>
              <span className="text-white font-extrabold text-xl">
                Naija<span className="text-green-400">Fashion</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nigeria&apos;s premier fashion destination. Celebrating African elegance with a global
              touch — from Ankara to designer wear.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                >
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
                ["Track My Order", "/track-order"],
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
                <MapPin size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  15 Bode Thomas Street, Surulere, Lagos, Nigeria
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={16} className="text-green-500 flex-shrink-0" />
                <a href="tel:+2348012345678" className="hover:text-green-400 transition-colors">
                  +234 801 234 5678
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={16} className="text-green-500 flex-shrink-0" />
                <a
                  href="mailto:hello@naijafashion.ng"
                  className="hover:text-green-400 transition-colors"
                >
                  hello@naijafashion.ng
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
              © {new Date().getFullYear()} NaijaFashion. All rights reserved. Made with ❤️ in
              Nigeria.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Secured payments via</span>
              <div className="flex gap-2 items-center">
                <div className="bg-gray-700 text-xs text-white px-2.5 py-1 rounded font-bold">
                  Paystack
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
