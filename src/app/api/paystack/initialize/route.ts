import { NextRequest, NextResponse } from "next/server";
import { generateOrderId } from "@/lib/utils";
import { priceCart, paystackRequest, CartLine } from "@/lib/paystack";

interface InitializeData {
  access_code: string;
  reference: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { email, customerName, phone, address, state, items } = body || {};

  if (!email || !/\S+@\S+\.\S+/.test(email) || !customerName || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required checkout details" }, { status: 400 });
  }

  try {
    const priced = await priceCart(items as CartLine[]);
    const orderId = generateOrderId();
    const reference = `${orderId}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const data = await paystackRequest<InitializeData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount: priced.total * 100,
        currency: "NGN",
        reference,
        metadata: {
          source: "ifashion",
          orderId,
          customerName,
          phone: phone ?? "",
          address: address ?? "",
          state: state ?? "",
          subtotal: priced.subtotal,
          delivery: priced.delivery,
          items: priced.items,
        },
      }),
    });

    return NextResponse.json({
      accessCode: data.access_code,
      reference: data.reference,
      orderId,
      subtotal: priced.subtotal,
      delivery: priced.delivery,
      total: priced.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
