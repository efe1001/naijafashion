import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { toApiProduct, DbProductRow } from "@/lib/product";

export async function GET(request: NextRequest) {
  const limit = Math.min(12, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 4));
  const sql = getSql();

  const sold = (await sql`
    SELECT json_extract(j.value, '$.productId') AS product_id,
           SUM(json_extract(j.value, '$.quantity')) AS units
    FROM orders o, json_each(o.items) j
    WHERE o.status NOT IN ('cancelled', 'refunded')
    GROUP BY product_id
    ORDER BY units DESC
    LIMIT 50
  `) as unknown as { product_id: string; units: number }[];

  const rows = (await sql`SELECT * FROM products WHERE status = 'active' AND in_stock = 1`) as unknown as DbProductRow[];
  const byId = new Map(rows.map((r) => [r.id, toApiProduct(r)]));

  const picked = sold.map((s) => byId.get(s.product_id)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, limit);
  if (picked.length < limit) {
    // Not enough sales yet: fill with best-reviewed, then newest products.
    const used = new Set(picked.map((p) => p.id));
    const rest = [...byId.values()]
      .filter((p) => !used.has(p.id))
      .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    picked.push(...rest.slice(0, limit - picked.length));
  }
  return NextResponse.json({ products: picked, basedOnSales: sold.length > 0 });
}
