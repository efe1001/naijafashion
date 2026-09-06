import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toApiOrder, DbOrderRow } from "@/lib/order";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = getSql();

  const rows = (await sql`
    UPDATE orders SET
      status = COALESCE(${body?.status ?? null}, status),
      note = CASE WHEN ${body?.note !== undefined} THEN ${body?.note || null} ELSE note END,
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbOrderRow[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order: toApiOrder(rows[0]) });
}
