'use client';

import {useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';

const STATUS_FR: Record<string, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée — en préparation',
  preparing: 'En préparation',
  ready: 'Prête !',
  completed: 'Terminée',
  cancelled: 'Annulée'
};
const STATUS_EN: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid — being prepared',
  preparing: 'Being prepared',
  ready: 'Ready!',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

interface TrackedOrder {
  id: string;
  status: string;
  items: {slug: string; name_fr: string; qty: number; unit_price_cad: number}[];
  total_cad: number;
  fulfillment: string;
}

export default function SuiviCommandePage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const statusLabel = locale === 'fr' ? STATUS_FR : STATUS_EN;

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(input.trim().toUpperCase())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setOrder(data);
    } catch {
      setError(
        locale === 'fr'
          ? 'Numéro de commande introuvable.'
          : 'Order number not found.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">{t('trackOrder')}</h1>
      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TLJ-XXXXXX"
          className="flex-1 rounded-xl border px-4 py-3 uppercase"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          OK
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {order && (
        <div className="mt-6 rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">{order.id}</p>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-900">
              {statusLabel[order.status] || order.status}
            </span>
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {order.items.map((i) => (
              <li key={i.slug} className="flex justify-between">
                <span>
                  {i.qty} × {i.name_fr}
                </span>
                <span>
                  {new Intl.NumberFormat(
                    locale === 'en' ? 'en-CA' : 'fr-CA',
                    {style: 'currency', currency: 'CAD'}
                  ).format(i.qty * i.unit_price_cad)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t pt-3 text-right font-bold">
            {new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
              style: 'currency',
              currency: 'CAD'
            }).format(order.total_cad)}
          </p>
        </div>
      )}
    </div>
  );
}
