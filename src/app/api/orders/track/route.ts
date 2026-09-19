import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { toApiOrder, DbOrderRow } from "@/lib/order";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!orderId || !email) {
    return NextResponse.json({ error: "Enter your order number and email" }, { status: 400 });
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND lower(customer_email) = ${email}
  `) as unknown as DbOrderRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "We couldn't find an order with those details" }, { status: 404 });
  }

  const events = await sql`SELECT status, note, created_at FROM order_events WHERE order_id = ${orderId} ORDER BY created_at ASC`;
  return NextResponse.json({ order: toApiOrder(rows[0]), events });
}
