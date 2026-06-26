import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "NaijaFashion — Nigeria's Premier Fashion Store",
  description:
    "Shop the best Nigerian traditional and international fashion — Agbada, Ankara, Aso-oke, Senator, designer wear and more. Fast delivery across Nigeria.",
  keywords: "Nigerian fashion, Ankara, Agbada, Aso-oke, Senator, African wear, clothes Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
