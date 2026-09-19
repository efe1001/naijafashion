import { getSql } from "@/lib/db";

export interface DbCouponRow {
  code: string;
  type: "percent" | "fixed";
  value: string | number;
  min_order: string | number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: number | boolean;
  created_at: string;
}

export interface ApiCoupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export function toApiCoupon(row: DbCouponRow): ApiCoupon {
  return {
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minOrder: Number(row.min_order),
    maxUses: row.max_uses == null ? null : Number(row.max_uses),
    usedCount: Number(row.used_count),
    expiresAt: row.expires_at,
    active: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export async function evaluateCoupon(rawCode: string, subtotal: number) {
  const code = rawCode.trim().toUpperCase();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM coupons WHERE code = ${code}`) as unknown as DbCouponRow[];
  const coupon = rows[0] ? toApiCoupon(rows[0]) : null;

  if (!coupon || !coupon.active) throw new Error("This coupon code is not valid");
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) throw new Error("This coupon has expired");
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) throw new Error("This coupon has reached its usage limit");
  if (subtotal < coupon.minOrder) {
    throw new Error(`Spend at least ₦${coupon.minOrder.toLocaleString()} to use this coupon`);
  }

  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return { code: coupon.code, type: coupon.type, value: coupon.value, discount };
}
