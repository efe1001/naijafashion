import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { toApiOrder, DbOrderRow, OrderItem } from "@/lib/order";
import { toApiProduct, DbProductRow } from "@/lib/product";
import { paystackRequest, PricedItem } from "@/lib/paystack";

interface VerifyData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  metadata: {
    source?: string;
    orderId?: string;
    customerName?: string;
    phone?: string;
    address?: string;
    state?: string;
    subtotal?: number;
    delivery?: number;
    items?: PricedItem[];
  } | null;
  customer: { email: string };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const reference = typeof body?.reference === "string" ? body.reference : "";
  if (!reference) {
    return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
  }

  let tx: VerifyData;
  try {
    tx = await paystackRequest<VerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const meta = tx.metadata;
  if (tx.status !== "success" || tx.currency !== "NGN") {
    return NextResponse.json({ error: "Payment was not successful" }, { status: 402 });
  }
  if (!meta || meta.source !== "ifashion" || !meta.orderId || !Array.isArray(meta.items)) {
    return NextResponse.json({ error: "This payment does not belong to an iFashion order" }, { status: 400 });
  }
  const expectedTotal = (Number(meta.subtotal) + Number(meta.delivery)) * 100;
  if (tx.amount !== expectedTotal) {
    return NextResponse.json({ error: "Paid amount does not match the order total" }, { status: 400 });
  }

  const sql = getSql();
  const products = (await sql`SELECT * FROM products`) as unknown as DbProductRow[];
  const images = new Map(products.map((p) => [p.id, toApiProduct(p).images[0] ?? ""]));
  const items: OrderItem[] = meta.items.map((i) => ({ ...i, image: images.get(i.productId) ?? "" }));

  const session = await getSessionFromRequest(request);

  await sql`
    INSERT INTO orders (
      id, user_id, customer_name, customer_email, phone, address, state,
      items, subtotal, delivery, total, payment_method, payment_ref
    ) VALUES (
      ${meta.orderId}, ${session?.sub ?? null}, ${meta.customerName ?? ""}, ${tx.customer.email},
      ${meta.phone ?? ""}, ${meta.address ?? ""}, ${meta.state ?? ""},
      ${JSON.stringify(items)}, ${meta.subtotal}, ${meta.delivery}, ${tx.amount / 100},
      ${`paystack-${tx.channel}`}, ${tx.reference}
    )
    ON CONFLICT(id) DO NOTHING
  `;

  const rows = (await sql`SELECT * FROM orders WHERE id = ${meta.orderId}`) as unknown as DbOrderRow[];
  return NextResponse.json({ order: toApiOrder(rows[0]) });
}
