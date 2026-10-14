'use client';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useCart} from '@/components/cart/CartProvider';

export default function ConfirmationContent() {
  const t = useTranslations('cart');
  const searchParams = useSearchParams();
  const {clear} = useCart();
  const [state, setState] = useState<'loading' | 'ok' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const order = searchParams.get('order') || '';
    const pi = searchParams.get('payment_intent') || '';
    setOrderId(order);
    if (!order || !pi) {
      setState('failed');
      return;
    }
    fetch('/api/checkout/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({orderId: order, paymentIntentId: pi})
    })
      .then((r) => r.json().then((d) => ({ok: r.ok, d})))
      .then(({ok, d}) => {
        if (ok && d.ok) {
          setState('ok');
          clear();
        } else {
          setState('failed');
        }
      })
      .catch(() => setState('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      {state === 'loading' && <p>{t('processing')}</p>}
      {state === 'ok' && (
        <>
          <p className="text-5xl">✅</p>
          <h1 className="mt-4 text-2xl font-bold">{t('orderConfirmed')}</h1>
          <p className="mt-2 text-neutral-600">{t('thankYou')}</p>
          <p className="mt-6 rounded-2xl bg-neutral-50 p-4">
            {t('orderNumber')}:{' '}
            <span className="text-xl font-bold">{orderId}</span>
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={`/suivi-commande?order=${orderId}`}
              className="rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-700"
            >
              {t('trackOrder')}
            </Link>
            <Link
              href="/"
              className="rounded-full border px-6 py-3 font-semibold hover:bg-neutral-100"
            >
              {t('backHome')}
            </Link>
          </div>
        </>
      )}
      {state === 'failed' && (
        <>
          <h1 className="text-2xl font-bold">{t('paymentFailed')}</h1>
          <Link
            href="/commander"
            className="mt-6 inline-block rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
          >
            {t('title')}
          </Link>
        </>
      )}
    </div>
  );
}
