import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort_order: number;
  item_count?: number;
}

function toApiCategory(r: DbCategoryRow) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image: r.image,
    itemCount: Number(r.item_count ?? 0),
  };
}

export async function GET() {
  const sql = getSql();
  const rows = (await sql`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category = c.slug AND p.status = 'active') AS item_count
    FROM categories c ORDER BY c.sort_order ASC, c.created_at ASC
  `) as unknown as DbCategoryRow[];
  return NextResponse.json({ categories: rows.map(toApiCategory) });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  const slug = (body?.slug?.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const sql = getSql();
  const clash = await sql`SELECT id FROM categories WHERE slug = ${slug}`;
  if (clash.length > 0) return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });

  const maxRows = (await sql`SELECT COALESCE(MAX(sort_order), -1) AS m FROM categories`) as unknown as { m: number }[];
  await sql`
    INSERT INTO categories (id, name, slug, description, image, sort_order)
    VALUES (${slug}, ${name}, ${slug}, ${body?.description ?? ""}, ${body?.image ?? ""}, ${Number(maxRows[0]?.m ?? -1) + 1})
  `;
  await logActivity(admin, "create", "category", slug, `Added category "${name}"`);
  return NextResponse.json({ ok: true, id: slug }, { status: 201 });
}
