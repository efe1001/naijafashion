import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { toApiOrder, DbOrderRow } from "@/lib/order";
import { generateOrderId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sql = getSql();
  const rows = (
    session.role === "admin"
      ? await sql`SELECT * FROM orders ORDER BY created_at DESC`
      : await sql`SELECT * FROM orders WHERE user_id = ${session.sub} ORDER BY created_at DESC`
  ) as unknown as DbOrderRow[];

  return NextResponse.json({ orders: rows.map(toApiOrder) });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  const body = await request.json().catch(() => null);
  const { customerName, customerEmail, phone, address, state, items, subtotal, delivery, total, paymentMethod, paymentRef } = body || {};

  if (!customerName || !customerEmail || !Array.isArray(items) || items.length === 0 || total == null) {
    return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
  }

  const id = body?.id || generateOrderId();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO orders (
      id, user_id, customer_name, customer_email, phone, address, state,
      items, subtotal, delivery, total, payment_method, payment_ref
    ) VALUES (
      ${id}, ${session?.sub ?? null}, ${customerName}, ${customerEmail}, ${phone ?? ""}, ${address ?? ""}, ${state ?? ""},
      ${JSON.stringify(items)}, ${subtotal ?? total}, ${delivery ?? 0}, ${total}, ${paymentMethod ?? null}, ${paymentRef ?? null}
    )
    RETURNING *
  `) as unknown as DbOrderRow[];

  return NextResponse.json({ order: toApiOrder(rows[0]) }, { status: 201 });
}
