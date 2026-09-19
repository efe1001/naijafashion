import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);

  const sql = getSql();
  await sql`
    UPDATE categories SET
      name = COALESCE(${body?.name?.trim() || null}, name),
      description = COALESCE(${body?.description ?? null}, description),
      image = COALESCE(${body?.image ?? null}, image)
    WHERE id = ${id}
  `;
  await logActivity(admin, "update", "category", id, `Edited category "${body?.name ?? id}"`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await ctx.params;

  const sql = getSql();
  const used = (await sql`SELECT COUNT(*) AS n FROM products WHERE category = ${id}`) as unknown as { n: number }[];
  if (Number(used[0]?.n) > 0) {
    return NextResponse.json(
      { error: `${used[0].n} product(s) still use this category. Move or delete them first.` },
      { status: 409 }
    );
  }
  await sql`DELETE FROM categories WHERE id = ${id}`;
  await logActivity(admin, "delete", "category", id, `Deleted category "${id}"`);
  return NextResponse.json({ ok: true });
}
