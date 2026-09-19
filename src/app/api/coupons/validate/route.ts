import { NextRequest, NextResponse } from "next/server";
import { evaluateCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const subtotal = Number(body?.subtotal);
  if (!code || !Number.isFinite(subtotal)) {
    return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
  }
  try {
    const result = await evaluateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid coupon" }, { status: 400 });
  }
}
