import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { toSafeUser, DbUserRow } from "@/lib/user";
import { logActivity } from "@/lib/activity";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = getSql();

  if (body?.password) {
    const passwordHash = await hashPassword(body.password);
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`;
  }

  const rows = (await sql`
    UPDATE users SET
      name = COALESCE(${body?.name ?? null}, name),
      email = COALESCE(${body?.email ?? null}, email),
      phone = COALESCE(${body?.phone ?? null}, phone),
      address = COALESCE(${body?.address ?? null}, address),
      state = COALESCE(${body?.state ?? null}, state),
      role = COALESCE(${body?.role ?? null}, role),
      status = COALESCE(${body?.status ?? null}, status)
    WHERE id = ${id}
    RETURNING id, name, email, password_hash, role, phone, address, state, status, created_at, last_login
  `) as unknown as DbUserRow[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const changed = [body?.role && `role → ${body.role}`, body?.status && `status → ${body.status}`, body?.password && "password reset"].filter(Boolean).join(", ");
  await logActivity(admin, "update", "user", id, `Edited user ${rows[0].email}${changed ? ": " + changed : ""}`);
  return NextResponse.json({ user: toSafeUser(rows[0]) });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const sql = getSql();
  const gone = (await sql`SELECT email FROM users WHERE id = ${id}`) as unknown as { email: string }[];
  await sql`DELETE FROM users WHERE id = ${id}`;
  await logActivity(admin, "delete", "user", id, `Deleted user ${gone[0]?.email ?? id}`);
  return NextResponse.json({ ok: true });
}
