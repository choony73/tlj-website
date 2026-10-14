'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Order} from '@/lib/orders';

const STATUSES = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'] as const;
const STATUS_KO: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '조리 중',
  ready: '픽업/배달 준비 완료',
  completed: '완료',
  cancelled: '취소됨'
};

export default function OrdersTable({initial}: {initial: Order[]}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status})
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? {...o, status} : o)));
    router.refresh();
  }

  function fmt(n: number) {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(n);
  }

  if (orders.length === 0) {
    return <p className="mt-6 text-neutral-500">아직 주문이 없습니다.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">{o.id}</p>
              <p className="text-sm text-neutral-500">
                {o.customer_name} · {o.customer_phone}
                {o.fulfillment === 'delivery' ? ' · 배달' : ' · 픽업'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{fmt(o.total_cad)}</span>
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_KO[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
            {o.items.map((i) => (
              <li key={i.slug} className="flex justify-between">
                <span>
                  {i.qty} × {i.name_fr}
                </span>
                <span className="text-neutral-500">
                  {fmt(i.qty * i.unit_price_cad)}
                </span>
              </li>
            ))}
          </ul>
          {o.notes && (
            <p className="mt-2 text-sm text-amber-800">메모: {o.notes}</p>
          )}
          {o.delivery_address && (
            <p className="mt-1 text-sm text-neutral-500">
              배달 주소: {o.delivery_address}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
