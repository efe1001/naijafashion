import { getSql } from "@/lib/db";
import { toApiProduct, DbProductRow } from "@/lib/product";

export const FREE_DELIVERY_THRESHOLD = 50000;
export const DELIVERY_FEE = 3500;

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

export async function priceCart(lines: CartLine[]) {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products`) as unknown as DbProductRow[];
  const catalog = new Map(rows.map((r) => [r.id, toApiProduct(r)]));

  const items: PricedItem[] = [];
  for (const line of lines) {
    const product = catalog.get(line.id);
    const quantity = Number(line.quantity);
    if (!product) throw new Error("A product in your cart is no longer available");
    if (!product.inStock) throw new Error(`${product.name} is out of stock`);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("Invalid quantity");
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
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return { items, subtotal, delivery, total: subtotal + delivery };
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
