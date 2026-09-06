import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { toSafeUser, DbUserRow } from "@/lib/user";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
    FROM users WHERE id = ${session.sub}
  `) as unknown as DbUserRow[];

  if (rows.length === 0) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: toSafeUser(rows[0]) });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const phone = body?.phone?.trim() ?? "";
  const address = body?.address?.trim() ?? "";
  const state = body?.state?.trim() ?? "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const sql = getSql();
  const rows = (await sql`
    UPDATE users SET name = ${name}, phone = ${phone}, address = ${address}, state = ${state}
    WHERE id = ${session.sub}
    RETURNING id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
  `) as unknown as DbUserRow[];

  return NextResponse.json({ user: toSafeUser(rows[0]) });
}
