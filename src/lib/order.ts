export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface DbOrderRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  state: string;
  items: OrderItem[] | string;
  subtotal: string | number;
  delivery: string | number;
  total: string | number;
  status: string;
  payment_method: string | null;
  payment_ref: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiOrder {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  state: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentRef: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

function parseItems(value: OrderItem[] | string): OrderItem[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toApiOrder(row: DbOrderRow): ApiOrder {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    phone: row.phone,
    address: row.address,
    state: row.state,
    items: parseItems(row.items),
    subtotal: Number(row.subtotal),
    delivery: Number(row.delivery),
    total: Number(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentRef: row.payment_ref,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
