"use client";

import { useEffect, useState } from "react";
import { Save, Store, Bell, Shield, Truck, CreditCard, CheckCircle2, MessageCircle, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminSettingsPage() {
  const {
    whatsappNumber: savedWhatsapp,
    storeInfo: savedStoreInfo,
    notifications: savedNotifications,
    payment: savedPayment,
    flashSale: savedFlashSale,
    saveSettings,
  } = useSettingsStore();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(savedWhatsapp);
  const [store, setStore] = useState(savedStoreInfo);
  const [notifications, setNotifications] = useState(savedNotifications);
  const [payment, setPayment] = useState(savedPayment);
  const [flashSale, setFlashSale] = useState(savedFlashSale);

  // Sync local drafts once settings finish loading from the server
  useEffect(() => { setWhatsappNumber(savedWhatsapp); }, [savedWhatsapp]);
  useEffect(() => { setStore(savedStoreInfo); }, [savedStoreInfo]);
  useEffect(() => { setNotifications(savedNotifications); }, [savedNotifications]);
  useEffect(() => { setPayment(savedPayment); }, [savedPayment]);
  useEffect(() => { setFlashSale(savedFlashSale); }, [savedFlashSale]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({ whatsappNumber, storeInfo: store, notifications, payment, flashSale });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200 text-sm disabled:opacity-60"
        >
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</>}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 size={16} className="text-green-600" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Flash Sale Banner */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-red-500" />
              <div>
                <h2 className="font-bold text-gray-900">Flash Sale Banner</h2>
                <p className="text-xs text-gray-400">Homepage countdown banner. Hidden until you turn it on.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFlashSale(p => ({ ...p, enabled: !p.enabled }))}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${flashSale.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {flashSale.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              {flashSale.enabled ? "ON — showing on homepage" : "OFF — hidden"}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {([
              { label: "Badge text", key: "badge" },
              { label: "Small heading (e.g. Up to)", key: "headline" },
              { label: "Highlighted offer (e.g. 40% Off)", key: "highlight" },
              { label: "Description line", key: "subtitle" },
              { label: "Button text", key: "buttonText" },
              { label: "Button link", key: "buttonLink" },
            ] as const).map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={flashSale[key]}
                  onChange={e => setFlashSale(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perks (comma separated)</label>
              <input
                type="text"
                value={flashSale.perks.join(", ")}
                onChange={e => setFlashSale(p => ({ ...p, perks: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale ends at</label>
              <input
                type="datetime-local"
                value={flashSale.endsAt}
                onChange={e => setFlashSale(p => ({ ...p, endsAt: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to count down to midnight tonight. The banner hides itself when the time runs out.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Remember to press Save Changes at the top.</p>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Store size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-900">Store Information</h2>
          </div>
          {[
            { label: "Store Name", key: "name" },
            { label: "Tagline", key: "tagline" },
            { label: "Support Email", key: "email" },
            { label: "Phone Number", key: "phone" },
            { label: "Address", key: "address" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                value={store[key as keyof typeof store]}
                onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {key === "phone" && (
                <p className="text-xs text-gray-400 mt-1">
                  General contact number shown to customers. This is not the WhatsApp number — set that below.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* WhatsApp Contact */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-900">WhatsApp Contact</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin WhatsApp Number</label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="+234 801 234 5678"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Customers use the &quot;Send Details to Admin on WhatsApp&quot; button on product pages to reach this number.
            </p>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-900">Delivery Settings</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select value={store.currency} onChange={e => setStore(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="NGN">NGN — Nigerian Naira (₦)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard Delivery Fee (₦)</label>
            <input type="number" value={store.deliveryFee} onChange={e => setStore(p => ({ ...p, deliveryFee: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (₦)</label>
            <input type="number" value={store.freeDeliveryThreshold} onChange={e => setStore(p => ({ ...p, freeDeliveryThreshold: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <p className="text-xs text-gray-400 mt-1">Orders above this amount get free delivery</p>
          </div>

          {/* Payment */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-green-700" />
              <h3 className="font-bold text-gray-800 text-sm">Payment Methods</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monnify API Key</label>
                <input type="text" value={payment.monnifyApiKey} onChange={e => setPayment(p => ({ ...p, monnifyApiKey: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Code</label>
                <input type="text" value={payment.monnifyContractCode} onChange={e => setPayment(p => ({ ...p, monnifyContractCode: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              {[
                { key: "enableCard", label: "Debit/Credit Card" },
                { key: "enableTransfer", label: "Account Transfer" },
                { key: "enableUssd", label: "USSD" },
                { key: "enablePhoneNumber", label: "Phone Number Pay" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setPayment(p => ({ ...p, [key]: !p[key as keyof typeof payment] }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${payment[key as keyof typeof payment] ? "bg-green-600" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${payment[key as keyof typeof payment] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-900">Email Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "newOrder", label: "New order placed", desc: "Get notified when a customer places an order" },
              { key: "orderShipped", label: "Order shipped", desc: "Notify when order status changes to shipped" },
              { key: "lowStock", label: "Low stock alert", desc: "Alert when a product goes out of stock" },
              { key: "newUser", label: "New user registered", desc: "Get notified when a new user signs up" },
              { key: "paymentFailed", label: "Payment failed", desc: "Alert when a payment attempt fails" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <div
                  onClick={() => setNotifications(p => ({ ...p, [key]: !p[key as keyof typeof notifications] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 mt-0.5 ${notifications[key as keyof typeof notifications] ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Two-Factor Authentication", desc: "Add an extra layer of security for admin login", enabled: false },
              { label: "Session Timeout", desc: "Automatically log out after 30 minutes of inactivity", enabled: true },
              { label: "Login Alerts", desc: "Send email alert on new admin login", enabled: true },
              { label: "IP Whitelist", desc: "Restrict admin access to specific IP addresses", enabled: false },
            ].map(({ label, desc, enabled: init }) => {
              const [on, setOn] = useState(init);
              return (
                <div key={label} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <div onClick={() => setOn(!on)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 mt-0.5 ${on ? "bg-green-600" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
