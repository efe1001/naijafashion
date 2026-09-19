import { getSql } from "@/lib/db";
import { toApiProduct, DbProductRow } from "@/lib/product";
import { computeDelivery, parseDeliverySettings, DeliverySettings } from "@/lib/delivery";
import { evaluateCoupon } from "@/lib/coupons";

export interface CartLine {
  id: string;
  quantity: number;
  size: string;
  color: string;
}

export interface PricedItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const sql = getSql();
  const rows = (await sql`SELECT store_info FROM settings WHERE id = 1`) as unknown as { store_info: string | Record<string, unknown> }[];
  const raw = rows[0]?.store_info;
  let info: Record<string, unknown> = {};
  try {
    info = typeof raw === "string" ? JSON.parse(raw) : raw ?? {};
  } catch {
    info = {};
  }
  return parseDeliverySettings(info, info.stateFees as Record<string, unknown> | undefined);
}

export async function priceCart(lines: CartLine[], opts: { state?: string; couponCode?: string } = {}) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products`) as unknown as DbProductRow[];
  const catalog = new Map(rows.map((r) => [r.id, toApiProduct(r)]));

  const requested = new Map<string, number>();
  const items: PricedItem[] = [];
  for (const line of lines) {
    const product = catalog.get(line.id);
    const quantity = Number(line.quantity);
    if (!product || product.status !== "active") throw new Error("A product in your cart is no longer available");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("Invalid quantity");

    const total = (requested.get(product.id) ?? 0) + quantity;
    requested.set(product.id, total);
    if (!product.inStock || product.stock <= 0) throw new Error(`${product.name} is out of stock`);
    if (total > product.stock) throw new Error(`Only ${product.stock} of ${product.name} left in stock`);

    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: String(line.size ?? ""),
      color: String(line.color ?? ""),
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const coupon = opts.couponCode ? await evaluateCoupon(opts.couponCode, subtotal) : null;
  const discount = coupon?.discount ?? 0;
  const delivery = computeDelivery(subtotal, opts.state ?? "", await getDeliverySettings());
  return {
    items,
    subtotal,
    discount,
    couponCode: coupon?.code ?? null,
    delivery,
    total: subtotal - discount + delivery,
  };
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => null)) as PaystackResponse<T> | null;
  if (!res.ok || !json?.status) {
    throw new Error(json?.message || `Paystack request failed (${res.status})`);
  }
  return json.data;
}
