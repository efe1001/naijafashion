import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { toApiProduct, DbProductRow } from "@/lib/product";

export async function GET(request: NextRequest) {
  const isAdmin = !!(await requireAdmin(request));
  const sql = getSql();
  const rows = (
    isAdmin
      ? await sql`SELECT * FROM products ORDER BY created_at DESC`
      : await sql`SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC`
  ) as unknown as DbProductRow[];
  return NextResponse.json({ products: rows.map(toApiProduct) });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.name || body?.price == null) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
  }

  const id = body.id || `prd-${Date.now()}`;
  const stock = Math.max(0, Math.floor(Number(body.stock ?? 0)) || 0);
  const status = body.status === "draft" ? "draft" : "active";
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO products (
      id, name, price, original_price, images, category, subcategory, description,
      sizes, colors, in_stock, stock, status, rating, review_count, badge, material, origin, videos
    ) VALUES (
      ${id}, ${body.name}, ${body.price}, ${body.originalPrice ?? null},
      ${JSON.stringify(body.images ?? ["https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80"])},
      ${body.category ?? "men"}, ${body.subcategory ?? ""}, ${body.description ?? ""},
      ${JSON.stringify(body.sizes ?? [])}, ${JSON.stringify(body.colors ?? [])},
      ${stock > 0 ? 1 : 0}, ${stock}, ${status}, 0, 0,
      ${body.badge || null}, ${body.material || null}, ${body.origin ?? "nigerian"}, ${JSON.stringify(body.videos ?? [])}
    )
    RETURNING *
  `) as unknown as DbProductRow[];

  await logActivity(admin, "create", "product", id, `Added product "${body.name}" (₦${Number(body.price).toLocaleString()}, stock ${stock}, ${status})`);
  return NextResponse.json({ product: toApiProduct(rows[0]) }, { status: 201 });
}
