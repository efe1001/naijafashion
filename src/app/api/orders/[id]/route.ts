import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest, requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { toApiOrder, DbOrderRow } from "@/lib/order";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const RESTOCK_STATUSES = ["cancelled", "refunded"];

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await ctx.params;

  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders WHERE id = ${id}`) as unknown as DbOrderRow[];
  const order = rows[0];
  if (!order || (session.role !== "admin" && order.user_id !== session.sub && order.customer_email.toLowerCase() !== session.email.toLowerCase())) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const events = await sql`SELECT status, note, created_at FROM order_events WHERE order_id = ${id} ORDER BY created_at ASC`;
  return NextResponse.json({ order: toApiOrder(order), events });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (body?.status && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const sql = getSql();

  const beforeRows = (await sql`SELECT * FROM orders WHERE id = ${id}`) as unknown as DbOrderRow[];
  const before = beforeRows[0];
  if (!before) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE orders SET
      status = COALESCE(${body?.status ?? null}, status),
      note = CASE WHEN ${body?.note !== undefined} THEN ${body?.note || null} ELSE note END,
      updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbOrderRow[];

  if (body?.status && body.status !== before.status) {
    await sql`
      INSERT INTO order_events (id, order_id, status, note, created_at)
      VALUES (${crypto.randomUUID()}, ${id}, ${body.status}, ${body?.note || null}, ${now})
    `;
    // Return the units to stock when an order is cancelled or refunded (only once).
    if (RESTOCK_STATUSES.includes(body.status) && !RESTOCK_STATUSES.includes(before.status)) {
      const items = toApiOrder(before).items;
      for (const item of items) {
        await sql`
          UPDATE products SET stock = stock + ${item.quantity}, in_stock = 1 WHERE id = ${item.productId}
        `;
      }
    }
    await logActivity(admin, "update", "order", id, `Order ${id}: ${before.status} → ${body.status}`);
  }

  return NextResponse.json({ order: toApiOrder(rows[0]) });
}
