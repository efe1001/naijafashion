import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface DbSettingsRow {
  whatsapp_number: string;
  store_info: Record<string, unknown> | string;
  notifications: Record<string, unknown> | string;
  payment: Record<string, unknown> | string;
}

function parseJsonObject(value: Record<string, unknown> | string): Record<string, unknown> {
  if (typeof value !== "string") return value ?? {};
  try {
    return JSON.parse(value) ?? {};
  } catch {
    return {};
  }
}

function toApiSettings(row: DbSettingsRow) {
  const { flashSale, ...storeInfo } = parseJsonObject(row.store_info);
  return {
    whatsappNumber: row.whatsapp_number,
    storeInfo,
    flashSale: flashSale ?? null,
    notifications: parseJsonObject(row.notifications),
    payment: parseJsonObject(row.payment),
  };
}

export async function GET() {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM settings WHERE id = 1`) as unknown as DbSettingsRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Settings not initialized" }, { status: 500 });
  }
  return NextResponse.json(toApiSettings(rows[0]));
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const sql = getSql();

  const current = (await sql`SELECT * FROM settings WHERE id = 1`) as unknown as DbSettingsRow[];
  const currentStoreInfo = parseJsonObject(current[0]?.store_info ?? {});
  const mergedStoreInfo =
    body?.storeInfo || body?.flashSale
      ? {
          ...(body?.storeInfo ?? currentStoreInfo),
          flashSale: body?.flashSale ?? currentStoreInfo.flashSale,
        }
      : null;

  const rows = (await sql`
    UPDATE settings SET
      whatsapp_number = COALESCE(${body?.whatsappNumber ?? null}, whatsapp_number),
      store_info = COALESCE(${mergedStoreInfo ? JSON.stringify(mergedStoreInfo) : null}, store_info),
      notifications = COALESCE(${body?.notifications ? JSON.stringify(body.notifications) : null}, notifications),
      payment = COALESCE(${body?.payment ? JSON.stringify(body.payment) : null}, payment)
    WHERE id = 1
    RETURNING *
  `) as unknown as DbSettingsRow[];

  return NextResponse.json(toApiSettings(rows[0]));
}
