import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 30));
  const entity = params.get("entity") ?? "";

  const sql = getSql();
  const rows = await sql`
    SELECT id, actor_name, action, entity, entity_id, summary, created_at FROM activity_log
    WHERE (${entity} = '' OR entity = ${entity})
    ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;
  const counted = (await sql`
    SELECT COUNT(*) AS n FROM activity_log WHERE (${entity} = '' OR entity = ${entity})
  `) as unknown as { n: number }[];

  return NextResponse.json({ entries: rows, total: Number(counted[0]?.n ?? 0), page, pageSize });
}
