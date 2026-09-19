import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toApiProduct, DbProductRow } from "@/lib/product";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products WHERE id = ${id}`) as unknown as DbProductRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product: toApiProduct(rows[0]) });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = getSql();

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
      in_stock = COALESCE(${body?.inStock ?? null}, in_stock),
      rating = COALESCE(${body?.rating ?? null}, rating),
      review_count = COALESCE(${body?.reviewCount ?? null}, review_count),
      badge = CASE WHEN ${body?.badge !== undefined} THEN ${body?.badge || null} ELSE badge END,
      material = COALESCE(${body?.material ?? null}, material),
      origin = COALESCE(${body?.origin ?? null}, origin),
      videos = COALESCE(${Array.isArray(body?.videos) ? JSON.stringify(body.videos) : null}, videos)
    WHERE id = ${id}
    RETURNING *
  `) as unknown as DbProductRow[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product: toApiProduct(rows[0]) });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const sql = getSql();
  await sql`DELETE FROM products WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
