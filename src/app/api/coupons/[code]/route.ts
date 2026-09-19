import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { code } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = getSql();
  await sql`UPDATE coupons SET active = ${body?.active ? 1 : 0} WHERE code = ${code}`;
  await logActivity(admin, "update", "coupon", code, `${body?.active ? "Enabled" : "Disabled"} coupon ${code}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { code } = await ctx.params;
  const sql = getSql();
  await sql`DELETE FROM coupons WHERE code = ${code}`;
  await logActivity(admin, "delete", "coupon", code, `Deleted coupon ${code}`);
  return NextResponse.json({ ok: true });
}
