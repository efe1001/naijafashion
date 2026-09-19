import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toApiOrder, DbOrderRow } from "@/lib/order";

const LOW_STOCK_LIMIT = 5;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const sql = getSql();

  const [totals, customers, products, monthly, statusRows, paymentRows, categoryRows, topRows, recent, newUsers, reviews, lowStock] =
    await Promise.all([
      sql`SELECT COUNT(*) AS orders,
                 COALESCE(SUM(CASE WHEN status NOT IN ('cancelled','refunded') THEN total END), 0) AS revenue,
                 COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 END), 0) AS pending
          FROM orders`,
      sql`SELECT COUNT(*) AS n FROM users WHERE role = 'user'`,
      sql`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'active' THEN 1 END), 0) AS active FROM products`,
      sql`SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS revenue
          FROM orders
          WHERE status NOT IN ('cancelled','refunded') AND created_at >= date('now', 'start of month', '-5 months')
          GROUP BY m`,
      sql`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`,
      sql`SELECT COALESCE(payment_method, 'unknown') AS method, COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue
          FROM orders WHERE status NOT IN ('cancelled','refunded') GROUP BY method ORDER BY n DESC`,
      sql`SELECT p.category AS category,
                 SUM(json_extract(j.value, '$.price') * json_extract(j.value, '$.quantity')) AS revenue
          FROM orders o, json_each(o.items) j
          JOIN products p ON p.id = json_extract(j.value, '$.productId')
          WHERE o.status NOT IN ('cancelled','refunded')
          GROUP BY p.category ORDER BY revenue DESC`,
      sql`SELECT json_extract(j.value, '$.productId') AS pid,
                 MAX(json_extract(j.value, '$.name')) AS name,
                 MAX(json_extract(j.value, '$.image')) AS image,
                 SUM(json_extract(j.value, '$.quantity')) AS units,
                 SUM(json_extract(j.value, '$.price') * json_extract(j.value, '$.quantity')) AS revenue
          FROM orders o, json_each(o.items) j
          WHERE o.status NOT IN ('cancelled','refunded')
          GROUP BY pid ORDER BY units DESC LIMIT 5`,
      sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`,
      sql`SELECT id, name, email, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT r.id, r.rating, r.comment, r.user_name, r.created_at, p.name AS product_name, p.id AS product_id
          FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC LIMIT 5`,
      sql`SELECT id, name, stock FROM products WHERE status = 'active' AND stock <= ${LOW_STOCK_LIMIT} ORDER BY stock ASC LIMIT 10`,
    ]);

  const byMonth = new Map((monthly as { m: string; revenue: number }[]).map((r) => [r.m, Number(r.revenue)]));
  const monthlyRevenue: { month: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenue.push({ month: MONTHS[d.getMonth()], value: byMonth.get(key) ?? 0 });
  }

  const t = (totals as { orders: number; revenue: number; pending: number }[])[0];
  const orderCount = Number(t?.orders ?? 0);
  const revenue = Number(t?.revenue ?? 0);

  return NextResponse.json({
    totals: {
      revenue,
      orders: orderCount,
      pending: Number(t?.pending ?? 0),
      customers: Number((customers as { n: number }[])[0]?.n ?? 0),
      products: Number((products as { total: number }[])[0]?.total ?? 0),
      activeProducts: Number((products as { active: number }[])[0]?.active ?? 0),
      avgOrderValue: orderCount ? Math.round(revenue / orderCount) : 0,
    },
    monthlyRevenue,
    statusCounts: Object.fromEntries((statusRows as { status: string; n: number }[]).map((r) => [r.status, Number(r.n)])),
    paymentMethods: (paymentRows as { method: string; n: number; revenue: number }[]).map((r) => ({
      method: r.method, count: Number(r.n), revenue: Number(r.revenue),
    })),
    revenueByCategory: (categoryRows as { category: string; revenue: number }[]).map((r) => ({
      category: r.category, revenue: Number(r.revenue),
    })),
    topProducts: (topRows as { pid: string; name: string; image: string; units: number; revenue: number }[]).map((r) => ({
      id: r.pid, name: r.name, image: r.image, units: Number(r.units), revenue: Number(r.revenue),
    })),
    recentOrders: (recent as unknown as DbOrderRow[]).map(toApiOrder),
    newUsers,
    recentReviews: reviews,
    lowStock,
    lowStockLimit: LOW_STOCK_LIMIT,
  });
}
