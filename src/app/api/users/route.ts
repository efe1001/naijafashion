import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { toSafeUser, DbUserRow } from "@/lib/user";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT
      u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.address, u.state,
      u.status, u.created_at, u.last_login,
      COALESCE(o.total_orders, 0) AS total_orders,
      COALESCE(o.total_spent, 0) AS total_spent
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS total_orders, SUM(total) AS total_spent
      FROM orders
      WHERE status NOT IN ('cancelled', 'refunded')
      GROUP BY user_id
    ) o ON o.user_id = u.id
    ORDER BY u.created_at DESC
  `) as unknown as (DbUserRow & { total_orders: number; total_spent: number })[];

  const users = rows.map((row) => ({
    ...toSafeUser(row),
    totalOrders: Number(row.total_orders),
    totalSpent: Number(row.total_spent),
  }));

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const role = body?.role === "admin" ? "admin" : "user";
  const status = body?.status === "suspended" ? "suspended" : "active";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  const sql = getSql();
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const rows = (await sql`
    INSERT INTO users (name, email, password_hash, role, phone, address, state, status)
    VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${body?.phone || null}, ${body?.address || null}, ${body?.state || null}, ${status})
    RETURNING id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
  `) as unknown as DbUserRow[];

  return NextResponse.json({ user: toSafeUser(rows[0]) }, { status: 201 });
}
