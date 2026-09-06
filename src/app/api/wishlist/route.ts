import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { toApiProduct, DbProductRow } from "@/lib/product";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ products: [] });
  }
  const sql = getSql();
  const rows = (await sql`
    SELECT p.* FROM wishlist_items w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ${session.sub}
    ORDER BY w.created_at DESC
  `) as unknown as DbProductRow[];

  return NextResponse.json({ products: rows.map(toApiProduct) });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Please log in to save items to your wishlist" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  const sql = getSql();
  await sql`
    INSERT INTO wishlist_items (user_id, product_id) VALUES (${session.sub}, ${body.productId})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const sql = getSql();
  const productId = request.nextUrl.searchParams.get("productId");
  if (productId) {
    await sql`DELETE FROM wishlist_items WHERE user_id = ${session.sub} AND product_id = ${productId}`;
  } else {
    await sql`DELETE FROM wishlist_items WHERE user_id = ${session.sub}`;
  }
  return NextResponse.json({ ok: true });
}
