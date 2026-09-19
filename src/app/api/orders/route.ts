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
  const params = request.nextUrl.searchParams;

  if (session.role === "admin" && params.has("page")) {
    const page = Math.max(1, Number(params.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 20));
    const q = (params.get("q") ?? "").trim();
    const like = `%${q}%`;
    const status = params.get("status") ?? "";
    const from = params.get("from") ?? "";
    const to = params.get("to") ? `${params.get("to")}T23:59:59.999Z` : "";
    const userId = params.get("userId") ?? "";

    const rows = (await sql`
      SELECT * FROM orders
      WHERE (${q} = '' OR id LIKE ${like} OR customer_name LIKE ${like} OR customer_email LIKE ${like} OR phone LIKE ${like} OR payment_ref LIKE ${like})
        AND (${status} = '' OR status = ${status})
        AND (${from} = '' OR created_at >= ${from})
        AND (${to} = '' OR created_at <= ${to})
        AND (${userId} = '' OR user_id = ${userId})
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `) as unknown as DbOrderRow[];
    const counted = (await sql`
      SELECT COUNT(*) AS n FROM orders
      WHERE (${q} = '' OR id LIKE ${like} OR customer_name LIKE ${like} OR customer_email LIKE ${like} OR phone LIKE ${like} OR payment_ref LIKE ${like})
        AND (${status} = '' OR status = ${status})
        AND (${from} = '' OR created_at >= ${from})
        AND (${to} = '' OR created_at <= ${to})
        AND (${userId} = '' OR user_id = ${userId})
    `) as unknown as { n: number }[];

    const statusRows = (await sql`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`) as unknown as { status: string; n: number }[];

    return NextResponse.json({
      statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, Number(r.n)])),
      orders: rows.map(toApiOrder),
      total: Number(counted[0]?.n ?? 0),
      page,
      pageSize,
    });
  }

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
  const now = new Date().toISOString();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO orders (
      id, user_id, customer_name, customer_email, phone, address, state,
      items, subtotal, delivery, total, payment_method, payment_ref, created_at, updated_at
    ) VALUES (
      ${id}, ${session?.sub ?? null}, ${customerName}, ${customerEmail}, ${phone ?? ""}, ${address ?? ""}, ${state ?? ""},
      ${JSON.stringify(items)}, ${subtotal ?? total}, ${delivery ?? 0}, ${total}, ${paymentMethod ?? null}, ${paymentRef ?? null},
      ${now}, ${now}
    )
    RETURNING *
  `) as unknown as DbOrderRow[];

  await sql`
    INSERT INTO order_events (id, order_id, status, note, created_at)
    VALUES (${crypto.randomUUID()}, ${id}, 'pending', 'Order placed', ${now})
  `;

  return NextResponse.json({ order: toApiOrder(rows[0]) }, { status: 201 });
}
