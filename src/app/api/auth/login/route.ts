import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { toSafeUser, DbUserRow } from "@/lib/user";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
    FROM users WHERE email = ${email}
  `) as unknown as DbUserRow[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const row = rows[0];
  if (row.status === "suspended") {
    return NextResponse.json({ error: "Your account has been suspended. Contact support." }, { status: 403 });
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const now = new Date().toISOString();
  await sql`UPDATE users SET last_login = ${now} WHERE id = ${row.id}`;

  const user = toSafeUser({ ...row, last_login: now });
  const token = await signSession({ sub: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({ user });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
