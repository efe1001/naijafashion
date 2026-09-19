"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, CreditCard, Smartphone, Building2, Phone } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, generateOrderId } from "@/lib/utils";
import { nigerianStates } from "@/data/products";
import { useDelivery } from "@/lib/useDelivery";

declare global {
  interface Window {
    MonnifySDK: {
      initialize: (config: Record<string, unknown>) => void;
    };
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        callbacks: {
          onSuccess?: (tx: { reference: string }) => void;
          onCancel?: () => void;
          onError?: (error: { message?: string }) => void;
        }
      ) => void;
    };
  }
}

type Gateway = "paystack" | "monnify";

function usePaystackScript() {
  useEffect(() => {
    if (document.getElementById("paystack-sdk")) return;
    const script = document.createElement("script");
    script.id = "paystack-sdk";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
}

type MonnifyPayMethod = "CARD" | "ACCOUNT_TRANSFER" | "USSD" | "PHONE_NUMBER";

const PAY_METHODS: { id: MonnifyPayMethod; icon: React.ElementType; label: string }[] = [
  { id: "CARD", icon: CreditCard, label: "Card" },
  { id: "ACCOUNT_TRANSFER", icon: Building2, label: "Bank Transfer" },
  { id: "USSD", icon: Smartphone, label: "USSD" },
  { id: "PHONE_NUMBER", icon: Phone, label: "Phone Pay" },
];

function useMonnifyScript() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || document.getElementById("monnify-sdk")) return;
    const script = document.createElement("script");
    script.id = "monnify-sdk";
    script.src = "https://sdk.monnify.com/plugin/monnify.js";
    script.async = true;
    document.body.appendChild(script);
    loaded.current = true;
  }, []);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currentUser } = useAuthStore();
  const total = getTotalPrice();
  const [gateway, setGateway] = useState<Gateway>("paystack");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "",
  });
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const { delivery } = useDelivery(total, form.state);
  const discount = gateway === "paystack" && coupon ? Math.min(coupon.discount, total) : 0;
  const grandTotal = total - discount + delivery;

  useMonnifyScript();
  usePaystackScript();

  const [payError, setPayError] = useState("");
  const [usedSavedAddress, setUsedSavedAddress] = useState(false);
  const [payMethod, setPayMethod] = useState<MonnifyPayMethod>("CARD");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser) return;
    setForm((f) => ({
      firstName: f.firstName || currentUser.name.split(" ")[0] || "",
      lastName: f.lastName || currentUser.name.split(" ").slice(1).join(" ") || "",
      email: f.email || currentUser.email || "",
      phone: f.phone || currentUser.phone || "",
      address: f.address || currentUser.address || "",
      city: f.city,
      state: f.state || currentUser.state || "",
    }));
    if (currentUser.address) setUsedSavedAddress(true);
  }, [currentUser]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 10) e.phone = "Valid phone required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state) e.state = "Required";
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal: total }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCoupon(null);
      setCouponError(data.error || "Invalid coupon");
      return;
    }
    setCoupon({ code: data.code, discount: data.discount });
  };

  const handlePaystack = async () => {
    setPayError("");
    if (!window.PaystackPop) {
      setPayError("Payment window is still loading. Please try again in a moment.");
      return;
    }
    setProcessing(true);
    try {
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          customerName: `${form.firstName} ${form.lastName}`,
          phone: form.phone,
          address: `${form.address}, ${form.city}`,
          state: form.state,
          couponCode: coupon?.code,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
          })),
        }),
      });
      const init = await initRes.json();
      if (!initRes.ok) throw new Error(init.error || "Could not start payment");

      new window.PaystackPop().resumeTransaction(init.accessCode, {
        onSuccess: async (tx) => {
          try {
            const verifyRes = await fetch("/api/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: tx.reference }),
            });
            const verified = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verified.error || "Could not confirm payment");
            clearCart();
            router.push(`/order-confirmation?orderId=${verified.order.id}&total=${verified.order.total}&name=${form.firstName}`);
          } catch (err) {
            setPayError(
              `${err instanceof Error ? err.message : "Could not confirm payment"}. If you were charged, contact us with reference ${tx.reference}.`
            );
            setProcessing(false);
          }
        },
        onCancel: () => setProcessing(false),
        onError: (error) => {
          setPayError(error?.message || "Payment failed. Please try again.");
          setProcessing(false);
        },
      });
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Could not start payment");
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (items.length === 0) { router.push("/products"); return; }
    if (gateway === "paystack") { handlePaystack(); return; }
    if (!window.MonnifySDK) {
      alert("Payment SDK is still loading. Please try again in a moment.");
      return;
    }

    const orderId = generateOrderId();
    setProcessing(true);

    window.MonnifySDK.initialize({
      amount: grandTotal,
      currency: "NGN",
      reference: `${orderId}-${Date.now()}`,
      customerFullName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      customerMobileNumber: form.phone,
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
      paymentDescription: `iFashion Order ${orderId}`,
      isTestMode: true,
      paymentMethods: [payMethod],
      metadata: {
        name: `${form.firstName} ${form.lastName}`,
        address: `${form.address}, ${form.city}, ${form.state}`,
      },
      onLoadStart: () => { setProcessing(true); },
      onLoadComplete: () => {},
      onComplete: async (response: Record<string, unknown>) => {
        if (response.paymentStatus === "PAID" || response.status === "SUCCESS") {
          try {
            await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: orderId,
                customerName: `${form.firstName} ${form.lastName}`,
                customerEmail: form.email,
                phone: form.phone,
                address: form.address,
                state: form.state,
                items: items.map((item) => ({
                  productId: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.selectedSize,
                  color: item.selectedColor,
                  image: item.images[0],
                })),
                subtotal: total,
                delivery,
                total: grandTotal,
                paymentMethod: payMethod,
                paymentRef: (response.transactionReference as string) || (response.paymentReference as string) || null,
              }),
            });
          } catch {
            // Payment already succeeded on Monnify's side; order-record failure shouldn't block the customer.
          }
          clearCart();
          router.push(`/order-confirmation?orderId=${orderId}&total=${grandTotal}&name=${form.firstName}`);
        } else {
          setProcessing(false);
        }
      },
      onClose: () => { setProcessing(false); },
    });
  };

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-4">Your cart is empty</p>
          <Link href="/products" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/cart" className="hover:text-green-700">Cart</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg">Delivery Information</h2>
                {usedSavedAddress && (
                  <Link href="/profile" className="text-xs text-green-700 font-semibold hover:underline">
                    Using saved address · Edit in profile
                  </Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {field("firstName", "First Name", "text", "Ada")}
                {field("lastName", "Last Name", "text", "Okonkwo")}
                {field("email", "Email Address", "email", "ada@example.com")}
                {field("phone", "Phone Number", "tel", "08012345678")}
              </div>
              <div className="mt-4">{field("address", "Delivery Address", "text", "15 Bode Thomas Street, Surulere")}</div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {field("city", "City", "text", "Lagos")}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select name="state" value={form.state} onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                    <option value="">Select State</option>
                    {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <Lock size={18} className="text-green-700" />
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {([
                  { id: "paystack", label: "Paystack", sub: "Card · Transfer · USSD" },
                  { id: "monnify", label: "Monnify", sub: "Card · Transfer · USSD" },
                ] as const).map(({ id, label, sub }) => (
                  <button key={id} onClick={() => setGateway(id)}
                    className={`p-4 border-2 rounded-xl text-left transition-colors ${gateway === id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <p className={`text-sm font-bold ${gateway === id ? "text-green-700" : "text-gray-700"}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>

              {gateway === "paystack" && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#0ba4db] rounded-lg flex items-center justify-center">
                      <span className="text-white font-extrabold text-xs">P</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Paystack Checkout</p>
                      <p className="text-xs text-gray-400">Secure · PCI DSS Compliant</p>
                    </div>
                    <Lock size={13} className="text-green-600 ml-auto" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Click &quot;Pay&quot; and the Paystack window opens, where you can pay by card, bank transfer or USSD. Your order is confirmed automatically once payment succeeds.
                  </p>
                </div>
              )}

              {gateway === "monnify" && (<>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {PAY_METHODS.map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setPayMethod(id)}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-colors ${payMethod === id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <Icon size={20} className={payMethod === id ? "text-green-700" : "text-gray-500"} />
                    <span className={`text-xs font-semibold text-center leading-tight ${payMethod === id ? "text-green-700" : "text-gray-600"}`}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Monnify preview panel */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#0055d4] rounded-lg flex items-center justify-center">
                    <span className="text-white font-extrabold text-xs">M</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Monnify Checkout</p>
                    <p className="text-xs text-gray-400">Secure · PCI DSS Compliant</p>
                  </div>
                  <Lock size={13} className="text-green-600 ml-auto" />
                </div>

                {payMethod === "CARD" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        onChange={e => { const v = e.target.value.replace(/\D/g,"").replace(/(\d{4})/g,"$1 ").trim(); e.target.value = v; }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Expiry (MM/YY)</label>
                        <input type="text" placeholder="MM / YY" maxLength={5}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                        <input type="password" placeholder="• • •" maxLength={3}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Click "Pay Securely" — Monnify popup will open to complete card payment.</p>
                  </div>
                )}

                {payMethod === "ACCOUNT_TRANSFER" && (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-800">Bank Transfer via Monnify</p>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Name</span>
                        <span className="font-bold text-gray-900">iFashion Ltd</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Number</span>
                        <span className="font-mono font-bold text-gray-900">1237931184</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank</span>
                        <span className="font-bold text-gray-900">Any Nigerian Bank</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">A unique virtual account will be generated at checkout. Transfer exact amount.</p>
                  </div>
                )}

                {payMethod === "USSD" && (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-800">USSD Payment via Monnify</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { bank: "GTBank", code: "*737*" },
                        { bank: "Zenith Bank", code: "*966*" },
                        { bank: "UBA", code: "*919*" },
                        { bank: "Access Bank", code: "*901*" },
                        { bank: "First Bank", code: "*894*" },
                        { bank: "Polaris Bank", code: "*833*" },
                      ].map(({ bank, code }) => (
                        <div key={bank} className="bg-white border border-gray-100 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-gray-700">{bank}</p>
                          <p className="font-mono text-green-700 font-bold text-sm">{code}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Monnify will provide the exact USSD code when you click Pay.</p>
                  </div>
                )}

                {payMethod === "PHONE_NUMBER" && (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-800">Pay with Phone Number</p>
                    <p className="text-gray-500">Enter your registered mobile money phone number. Monnify will send a payment prompt to your phone.</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Money Number</label>
                      <input type="tel" placeholder="080XXXXXXXX"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <p className="text-xs text-gray-400">Supported: Opay, PalmPay, Kuda, and other mobile wallets.</p>
                  </div>
                )}
              </div>
              </>)}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24 space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.selectedSize} · {item.selectedColor} · Qty {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={`font-medium ${delivery === 0 ? "text-green-600" : ""}`}>
                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({coupon?.code})</span><span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-gray-900 text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-green-700">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {gateway === "paystack" && (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button onClick={applyCoupon} type="button" className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">Apply</button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  {coupon && <p className="text-green-700 text-xs mt-1">Coupon {coupon.code} applied.</p>}
                </div>
              )}

              {payError && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">{payError}</p>}

              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${processing ? "bg-gray-400 cursor-not-allowed" : gateway === "paystack" ? "bg-[#0ba4db] hover:bg-[#0990bf] shadow-sky-200" : "bg-[#0055d4] hover:bg-[#0046b0] shadow-blue-200"}`}
              >
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                ) : (
                  <><Lock size={16} />Pay {formatPrice(grandTotal)} with {gateway === "paystack" ? "Paystack" : "Monnify"}</>
                )}
              </button>

              <div className="flex items-center justify-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${gateway === "paystack" ? "bg-[#0ba4db]" : "bg-[#0055d4]"}`}>
                  <span className="text-white font-extrabold text-[9px]">{gateway === "paystack" ? "P" : "M"}</span>
                </div>
                <p className="text-xs text-gray-400">100% secure · Powered by {gateway === "paystack" ? "Paystack" : "Monnify"} · PCI DSS</p>
                <Lock size={10} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
