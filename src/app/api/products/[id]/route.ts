import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { toApiProduct, DbProductRow } from "@/lib/product";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products WHERE id = ${id}`) as unknown as DbProductRow[];
  const product = rows[0] ? toApiProduct(rows[0]) : null;
  if (!product || (product.status === "draft" && !(await requireAdmin(request)))) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = getSql();

  const beforeRows = (await sql`SELECT * FROM products WHERE id = ${id}`) as unknown as DbProductRow[];
  if (beforeRows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const before = toApiProduct(beforeRows[0]);

  const stockVal =
    body?.stock != null && Number.isFinite(Number(body.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : null;
  const statusVal = body?.status === "draft" || body?.status === "active" ? body.status : null;

  const rows = (await sql`
    UPDATE products SET
      name = COALESCE(${body?.name ?? null}, name),
      price = COALESCE(${body?.price ?? null}, price),
      original_price = CASE WHEN ${body?.originalPrice !== undefined} THEN ${body?.originalPrice ?? null} ELSE original_price END,
      images = COALESCE(${body?.images ? JSON.stringify(body.images) : null}, images),
      category = COALESCE(${body?.category ?? null}, category),
      subcategory = COALESCE(${body?.subcategory ?? null}, subcategory),
      description = COALESCE(${body?.description ?? null}, description),
      sizes = COALESCE(${body?.sizes ? JSON.stringify(body.sizes) : null}, sizes),
      colors = COALESCE(${body?.colors ? JSON.stringify(body.colors) : null}, colors),
      stock = COALESCE(${stockVal}, stock),
      in_stock = CASE WHEN ${stockVal !== null} THEN ${stockVal !== null && stockVal > 0 ? 1 : 0} ELSE COALESCE(${body?.inStock ?? null}, in_stock) END,
      status = COALESCE(${statusVal}, status),
      badge = CASE WHEN ${body?.badge !== undefined} THEN ${body?.badge || null} ELSE badge END,
      material = COALESCE(${body?.material ?? null}, material),
      origin = COALESCE(${body?.origin ?? null}, origin),
      videos = COALESCE(${Array.isArray(body?.videos) ? JSON.stringify(body.videos) : null}, videos)
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbProductRow[];

  const after = toApiProduct(rows[0]);
  const changes: string[] = [];
  if (after.name !== before.name) changes.push(`name "${before.name}" → "${after.name}"`);
  if (after.price !== before.price) changes.push(`price ₦${before.price.toLocaleString()} → ₦${after.price.toLocaleString()}`);
  if (after.stock !== before.stock) changes.push(`stock ${before.stock} → ${after.stock}`);
  if (after.status !== before.status) changes.push(`status ${before.status} → ${after.status}`);
  await logActivity(admin, "update", "product", id, `Edited "${after.name}"${changes.length ? ": " + changes.join(", ") : ""}`);

  return NextResponse.json({ product: after });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const sql = getSql();
  const rows = (await sql`SELECT name FROM products WHERE id = ${id}`) as unknown as { name: string }[];
  await sql`DELETE FROM products WHERE id = ${id}`;
  await logActivity(admin, "delete", "product", id, `Deleted product "${rows[0]?.name ?? id}"`);
  return NextResponse.json({ ok: true });
}
