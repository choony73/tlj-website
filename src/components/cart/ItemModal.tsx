'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useCart, type CartOption} from './CartProvider';
import {itemName, itemDescription, formatPrice, type MenuItem} from '@/lib/menu';

export default function ItemModal({
  item,
  onClose
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const {add} = useCart();

  const [qty, setQty] = useState(1);
  // groupIdx -> 선택된 option 인덱스 배열
  const [sel, setSel] = useState<Record<number, number[]>>({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  function groupName(g: MenuItem['option_groups'][number]) {
    return locale === 'en' && g.name_en ? g.name_en : g.name_fr;
  }
  function optionName(o: {name_fr: string; name_en: string | null}) {
    return locale === 'en' && o.name_en ? o.name_en : o.name_fr;
  }

  function toggle(gi: number, oi: number) {
    const g = item.option_groups[gi];
    setSel((prev) => {
      const cur = prev[gi] || [];
      if (g.multiple) {
        if (cur.includes(oi)) return {...prev, [gi]: cur.filter((x) => x !== oi)};
        const max = g.max || Infinity;
        if (cur.length >= max) return prev;
        return {...prev, [gi]: [...cur, oi]};
      }
      return {...prev, [gi]: [oi]};
    });
  }

  const missingRequired = useMemo(
    () =>
      item.option_groups.some(
        (g, gi) => g.required && !(sel[gi] && sel[gi].length > 0)
      ),
    [item.option_groups, sel]
  );

  const unitDelta = useMemo(
    () =>
      item.option_groups.reduce((sum, g, gi) => {
        const chosen = sel[gi] || [];
        return (
          sum +
          chosen.reduce((s, oi) => s + (g.options[oi]?.price_delta || 0), 0)
        );
      }, 0),
    [item.option_groups, sel]
  );

  const unitPrice = item.price_cad + unitDelta;
  const total = unitPrice * qty;

  function onAdd() {
    if (missingRequired || !item.available) return;
    const options: CartOption[] = [];
    item.option_groups.forEach((g, gi) => {
      (sel[gi] || []).forEach((oi) => {
        const o = g.options[oi];
        if (o) {
          options.push({
            group_fr: g.name_fr,
            option_fr: o.name_fr,
            price_delta: o.price_delta
          });
        }
      });
    });
    add(item.slug, qty, options);
    onClose();
  }

  function fmt(n: number) {
    return formatPrice(n, locale);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-neutral-950 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative min-h-64">
            {item.image ? (
              <img
                src={item.image}
                alt={itemName(item, locale)}
                className="h-full max-h-[90vh] w-full object-cover md:rounded-l-3xl"
              />
            ) : (
              <div className="h-64 w-full bg-neutral-800 md:h-full" />
            )}
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <h2 className="text-2xl font-bold">{itemName(item, locale)}</h2>

            <div className="mt-2 flex flex-wrap gap-2">
              {item.is_vegetarian && (
                <span className="rounded-full bg-green-900 px-3 py-1 text-xs font-semibold text-green-300">
                  🌿 {t('vegetarian')}
                </span>
              )}
              {item.is_spicy && (
                <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-red-300">
                  🌶 {t('spicy')}
                </span>
              )}
            </div>

            <p className="mt-3 text-3xl font-bold text-amber-400">
              {fmt(item.price_cad)}
            </p>
            {itemDescription(item, locale) && (
              <p className="mt-3 text-sm text-neutral-400">
                {itemDescription(item, locale)}
              </p>
            )}

            {item.option_groups.length > 0 && (
              <div className="mt-5 space-y-5">
                {item.option_groups.map((g, gi) => (
                  <div key={gi}>
                    <p className="font-semibold">
                      {groupName(g)}{' '}
                      {g.required && <span className="text-red-400">*</span>}
                      {g.multiple && g.max && (
                        <span className="ml-2 text-xs font-normal text-neutral-500">
                          (max {g.max})
                        </span>
                      )}
                    </p>
                    <div className="mt-2 space-y-2">
                      {g.options.map((o, oi) => {
                        const checked = (sel[gi] || []).includes(oi);
                        return (
                          <label
                            key={oi}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
                              checked
                                ? 'border-amber-400 bg-amber-400/10'
                                : 'border-neutral-700 hover:border-neutral-500'
                            }`}
                          >
                            <input
                              type={g.multiple ? 'checkbox' : 'radio'}
                              name={`opt-${gi}`}
                              checked={checked}
                              onChange={() => toggle(gi, oi)}
                              className="h-4 w-4 accent-amber-400"
                            />
                            <span className="flex-1">{optionName(o)}</span>
                            {o.price_delta > 0 && (
                              <span className="text-neutral-400">
                                +{fmt(o.price_delta)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {missingRequired && item.option_groups.length > 0 && (
              <p className="mt-3 text-sm text-red-400">{t('selectRequired')}</p>
            )}

            <div className="mt-auto flex items-center gap-3 pt-6">
              <div className="flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:bg-neutral-800"
                  aria-label="-"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:bg-neutral-800"
                  aria-label="+"
                >
                  +
                </button>
              </div>
              <button
                onClick={onAdd}
                disabled={missingRequired || !item.available}
                className="flex-1 rounded-full bg-amber-400 py-3 font-bold text-neutral-950 transition hover:bg-amber-300 disabled:opacity-40"
              >
                🛒 {t('addToCart')} • {fmt(total)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
