'use client';

import {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/navigation';
import {useCart} from './CartProvider';
import {calcTax} from '@/lib/pricing';

interface MenuInfo {
  slug: string;
  name_fr: string;
  name_en: string | null;
  price_cad: number;
  image: string | null;
}

// 헤더 장바구니 클릭 시 우측에서 나오는 서랍
export default function CartDrawer({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();
  const {lines, setQty, remove, clear} = useCart();
  const [menu, setMenu] = useState<MenuInfo[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMenuLoaded(false);
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => {
        setMenu(d.items || []);
        setMenuLoaded(true);
      })
      .catch(() => setMenuLoaded(true));
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => {
          const info = menu.find((m) => m.slug === l.slug);
          const unitPrice =
            (info?.price_cad || 0) +
            l.options.reduce((s, o) => s + (o.price_delta || 0), 0);
          return {...l, info, unitPrice};
        })
        .filter((l) => l.info),
    [lines, menu]
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = detailed.reduce((n, l) => n + l.qty * l.unitPrice, 0);
  const taxes = calcTax(subtotal);
  const total = Math.round((subtotal + taxes) * 100) / 100;

  function nameOf(m: MenuInfo) {
    return locale === 'en' && m.name_en ? m.name_en : m.name_fr;
  }
  function fmt(n: number) {
    return new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(n);
  }

  function goCheckout() {
    onClose();
    router.push('/commander');
  }

  // 헤더의 backdrop-blur가 fixed 요소의 기준을 깨뜨리므로 body로 포털
  if (!mounted) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-white text-neutral-900 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={t('yourCart')}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">
            🛒 {t('yourCart')}{' '}
            <span className="font-normal text-neutral-500">
              ({t('cartCount', {count})})
            </span>
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!menuLoaded ? (
            <div className="py-16 text-center text-neutral-400">
              <p className="animate-pulse text-3xl">🛒</p>
            </div>
          ) : detailed.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-neutral-500">{t('empty')}</p>
              <Link
                href="/menu"
                onClick={onClose}
                className="mt-6 inline-block rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-700"
              >
                {t('browseMenu')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {detailed.map((l, idx) => (
                <li
                  key={`${l.slug}-${idx}`}
                  className="flex gap-3 rounded-2xl bg-neutral-50 p-3"
                >
                  {l.info?.image && (
                    <img
                      src={l.info.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {l.info && nameOf(l.info)}
                    </p>
                    {l.options.length > 0 && (
                      <p className="truncate text-xs text-neutral-500">
                        {l.options.map((o) => o.option_fr).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500">
                      {fmt(l.unitPrice)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(l.slug, l.qty - 1, l.options)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border bg-white hover:bg-neutral-100"
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {l.qty}
                      </span>
                      <button
                        onClick={() => setQty(l.slug, l.qty + 1, l.options)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border bg-white hover:bg-neutral-100"
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <span className="font-bold">
                      {fmt(l.qty * l.unitPrice)}
                    </span>
                    <button
                      onClick={() => remove(l.slug, l.options)}
                      aria-label={t('remove')}
                      className="text-neutral-400 hover:text-red-700"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detailed.length > 0 && (
          <div className="border-t px-5 py-4">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{t('subtotal')}</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-neutral-600">
              <span>{t('taxes')}</span>
              <span>{fmt(taxes)}</span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span>{fmt(total)}</span>
            </div>
            <button
              onClick={goCheckout}
              className="mt-4 w-full rounded-full bg-amber-400 py-3.5 font-bold text-neutral-950 hover:bg-amber-300"
            >
              {t('proceedToCheckout')}
            </button>
            <button
              onClick={clear}
              className="mt-2 w-full py-2 text-sm text-neutral-500 hover:text-red-700"
            >
              {t('clearCart')}
            </button>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
