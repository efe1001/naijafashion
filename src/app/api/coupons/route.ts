import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { toApiCoupon, DbCouponRow } from "@/lib/coupons";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const sql = getSql();
  const rows = (await sql`SELECT * FROM coupons ORDER BY created_at DESC`) as unknown as DbCouponRow[];
  return NextResponse.json({ coupons: rows.map(toApiCoupon) });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const type = body?.type === "fixed" ? "fixed" : "percent";
  const value = Number(body?.value);
  if (!code || !Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Enter a code and a discount value" }, { status: 400 });
  }
  if (type === "percent" && value > 100) {
    return NextResponse.json({ error: "A percentage discount cannot exceed 100" }, { status: 400 });
  }

  const sql = getSql();
  const clash = await sql`SELECT code FROM coupons WHERE code = ${code}`;
  if (clash.length > 0) return NextResponse.json({ error: "This coupon code already exists" }, { status: 409 });

  await sql`
    INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at, active)
    VALUES (${code}, ${type}, ${value}, ${Number(body?.minOrder) || 0},
            ${body?.maxUses ? Number(body.maxUses) : null}, ${body?.expiresAt || null}, 1)
  `;
  await logActivity(admin, "create", "coupon", code, `Created coupon ${code} (${type === "percent" ? value + "%" : "₦" + value.toLocaleString()} off)`);
  return NextResponse.json({ ok: true, code }, { status: 201 });
}
