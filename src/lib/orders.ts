import {sql, isDbConfigured} from './db';

export interface OrderLineOption {
  group_fr: string;
  option_fr: string;
  price_delta: number;
}

export interface OrderLine {
  slug: string;
  name_fr: string;
  qty: number;
  unit_price_cad: number;
  options: OrderLineOption[];
}

export interface Order {
  id: string;
  items: OrderLine[];
  subtotal_cad: number;
  delivery_fee_cad: number;
  total_cad: number;
  fulfillment: 'pickup' | 'delivery';
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  notes: string | null;
  status: string;
  stripe_payment_intent: string | null;
  created_at: string;
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TLJ-${s}`;
}

export async function createOrder(
  order: Omit<Order, 'status' | 'created_at'>
): Promise<Order> {
  if (!isDbConfigured || !sql) throw new Error('DB not configured');
  const rows = await sql`
    INSERT INTO orders
      (id, items, subtotal_cad, delivery_fee_cad, total_cad, fulfillment,
       customer_name, customer_phone, customer_email, delivery_address,
       notes, status, stripe_payment_intent)
    VALUES
      (${order.id}, ${JSON.stringify(order.items)}, ${order.subtotal_cad},
       ${order.delivery_fee_cad}, ${order.total_cad}, ${order.fulfillment},
       ${order.customer_name}, ${order.customer_phone}, ${order.customer_email},
       ${order.delivery_address}, ${order.notes}, 'pending', ${order.stripe_payment_intent})
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isDbConfigured || !sql) return null;
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

export async function markOrderPaid(
  id: string,
  paymentIntentId: string
): Promise<void> {
  if (!isDbConfigured || !sql) return;
  await sql`
    UPDATE orders
    SET status = 'paid', stripe_payment_intent = ${paymentIntentId}, updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
  `;
}

export async function listOrders(limit = 50): Promise<Order[]> {
  if (!isDbConfigured || !sql) return [];
  const rows = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

export async function setOrderStatus(id: string, status: string): Promise<void> {
  if (!isDbConfigured || !sql) return;
  const allowed = ['paid', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!allowed.includes(status)) throw new Error('Invalid status');
  await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}
  `;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): Order {
  const items = (typeof r.items === 'string' ? JSON.parse(r.items) : r.items).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (it: any) => ({options: [], ...it})
  );
  return {
    id: r.id,
    items,
    subtotal_cad: Number(r.subtotal_cad),
    delivery_fee_cad: Number(r.delivery_fee_cad),
    total_cad: Number(r.total_cad),
    fulfillment: r.fulfillment,
    customer_name: r.customer_name,
    customer_phone: r.customer_phone,
    customer_email: r.customer_email,
    delivery_address: r.delivery_address,
    notes: r.notes,
    status: r.status,
    stripe_payment_intent: r.stripe_payment_intent,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
  };
}
