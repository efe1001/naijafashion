import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 200) : [];
  const action = body?.action;
  if (ids.length === 0 || !["delete", "publish", "draft"].includes(action)) {
    return NextResponse.json({ error: "Choose products and a valid action" }, { status: 400 });
  }

  const sql = getSql();
  for (const id of ids) {
    if (action === "delete") await sql`DELETE FROM products WHERE id = ${id}`;
    else await sql`UPDATE products SET status = ${action === "publish" ? "active" : "draft"} WHERE id = ${id}`;
  }
  await logActivity(admin, action === "delete" ? "delete" : "update", "product", null, `Bulk ${action} on ${ids.length} product(s)`);
  return NextResponse.json({ ok: true, count: ids.length });
}
