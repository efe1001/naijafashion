import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { toSafeUser, DbUserRow } from "@/lib/user";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const sql = getSql();

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  const rows = (await sql`
    INSERT INTO users (id, name, email, password_hash, phone, address, state)
    VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${body?.phone || null}, ${body?.address || null}, ${body?.state || null})
    RETURNING id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
  `) as unknown as DbUserRow[];

  const user = toSafeUser(rows[0]);
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
