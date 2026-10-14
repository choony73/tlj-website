'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {loadStripe} from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {useCart} from './CartProvider';
import {Link} from '@/i18n/navigation';

interface MenuInfo {
  slug: string;
  name_fr: string;
  name_en: string | null;
  price_cad: number;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

function PaymentStep({
  clientSecret,
  orderId,
  locale
}: {
  clientSecret: string;
  orderId: string;
  locale: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('cart');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onPay() {
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale === 'fr' ? '' : 'en/'}commande-confirmee?order=${orderId}`
      }
    });
    if (error) {
      setError(error.message || t('paymentFailed'));
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border p-6">
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        onClick={onPay}
        disabled={busy || !stripe}
        className="mt-6 w-full rounded-xl bg-red-700 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
      >
        {busy ? t('processing') : t('pay')}
      </button>
    </div>
  );
}

export default function CheckoutFlow() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();
  const {lines, setQty, remove, clear} = useCart();

  const [menu, setMenu] = useState<MenuInfo[]>([]);
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [step, setStep] = useState<'cart' | 'info' | 'payment'>('cart');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => setMenu(d.items || []))
      .catch(() => {});
  }, []);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => ({...l, info: menu.find((m) => m.slug === l.slug)}))
        .filter((l) => l.info),
    [lines, menu]
  );

  const subtotal = detailed.reduce(
    (n, l) => n + l.qty * (l.info?.price_cad || 0),
    0
  );
  const deliveryFee = fulfillment === 'delivery' ? 4.99 : 0;
  const total = subtotal + deliveryFee;

  function nameOf(m: MenuInfo) {
    return locale === 'en' && m.name_en ? m.name_en : m.name_fr;
  }
  function fmt(n: number) {
    return new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(n);
  }

  async function startPayment() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lines: lines.map((l) => ({slug: l.slug, qty: l.qty})),
          fulfillment,
          customer
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setOrderId(data.orderId);
      setClientSecret(data.clientSecret);
      setStep('payment');
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  const infoValid =
    customer.name.trim() &&
    customer.phone.trim() &&
    (fulfillment === 'pickup' || customer.address.trim());

  if (lines.length === 0 && step === 'cart') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-neutral-600">{t('empty')}</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
        >
          {t('browseMenu')}
        </Link>
      </div>
    );
  }

  const input =
    'w-full rounded-xl border px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none';
  const label = 'mb-1 block text-sm font-medium text-neutral-700';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {step === 'cart' && (
        <>
          <h2 className="mt-6 font-semibold">{t('yourCart')}</h2>
          <div className="mt-3 divide-y rounded-2xl border px-4">
            {detailed.map((l) => (
              <div key={l.slug} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{l.info && nameOf(l.info)}</p>
                  <p className="text-sm text-neutral-500">
                    {fmt(l.info?.price_cad || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(l.slug, l.qty - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{l.qty}</span>
                  <button
                    onClick={() => setQty(l.slug, l.qty + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-neutral-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(l.slug)}
                    className="ml-2 text-sm text-neutral-400 hover:text-red-700"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-semibold">{t('fulfillment')}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(['pickup', 'delivery'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFulfillment(f)}
                className={`rounded-2xl border p-4 text-left ${
                  fulfillment === f
                    ? 'border-red-700 bg-red-50'
                    : 'hover:border-neutral-400'
                }`}
              >
                <p className="font-medium">{t(f)}</p>
                <p className="text-sm text-neutral-500">
                  {f === 'delivery' ? fmt(4.99) : t('free')}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-900">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('deliveryFee')}</span>
              <span>{deliveryFee ? fmt(deliveryFee) : t('free')}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>{t('total')}</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setStep('info');
              window.scrollTo(0, 0);
            }}
            className="mt-6 w-full rounded-xl bg-neutral-900 py-3 font-semibold text-white hover:bg-neutral-700"
          >
            {t('continueToPayment')}
          </button>
        </>
      )}

      {step === 'info' && (
        <div className="mt-6 space-y-4">
          <button
            onClick={() => setStep('cart')}
            className="text-sm text-neutral-500 hover:underline"
          >
            ← {t('yourCart')}
          </button>
          <div>
            <label className={label}>{t('name')} *</label>
            <input
              className={input}
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
            />
          </div>
          <div>
            <label className={label}>{t('phone')} *</label>
            <input
              className={input}
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            />
          </div>
          <div>
            <label className={label}>{t('email')}</label>
            <input
              className={input}
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({...customer, email: e.target.value})}
            />
          </div>
          {fulfillment === 'delivery' && (
            <div>
              <label className={label}>{t('address')} *</label>
              <input
                className={input}
                value={customer.address}
                onChange={(e) =>
                  setCustomer({...customer, address: e.target.value})
                }
              />
            </div>
          )}
          <div>
            <label className={label}>{t('notes')}</label>
            <textarea
              className={input}
              rows={3}
              value={customer.notes}
              onChange={(e) => setCustomer({...customer, notes: e.target.value})}
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            onClick={startPayment}
            disabled={busy || !infoValid}
            className="w-full rounded-xl bg-red-700 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {busy ? t('processing') : `${t('continueToPayment')} · ${fmt(total)}`}
          </button>
        </div>
      )}

      {step === 'payment' && clientSecret && (
        <div className="mt-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              locale: locale === 'en' ? 'en' : 'fr'
            }}
          >
            <PaymentStep
              clientSecret={clientSecret}
              orderId={orderId}
              locale={locale}
            />
          </Elements>
          <p className="mt-4 text-center text-sm text-neutral-500">
            {t('orderNumber')}: <span className="font-bold">{orderId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
