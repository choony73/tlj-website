'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import ItemModal from './ItemModal';
import QuickAddButton from './QuickAddButton';
import {
  itemName,
  itemDescription,
  formatPrice,
  type MenuItem
} from '@/lib/menu';

export default function CategoryGrid({items}: {items: MenuItem[]}) {
  const locale = useLocale();
  const t = useTranslations('cart');
  const [selected, setSelected] = useState<MenuItem | null>(null);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.slug}
            className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600 hover:shadow-lg"
          >
            <button
              onClick={() => setSelected(item)}
              className="block w-full text-left"
              aria-label={itemName(item, locale)}
            >
              <div className="relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={itemName(item, locale)}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-neutral-800" />
                )}
                <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
                  {item.is_vegetarian && (
                    <span className="rounded-full bg-green-900/90 px-2.5 py-0.5 text-xs font-semibold text-green-300">
                      🌿 {t('vegetarian')}
                    </span>
                  )}
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-neutral-950">
                    {formatPrice(item.price_cad, locale)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-white">
                  {itemName(item, locale)}
                </p>
                {itemDescription(item, locale) && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                    {itemDescription(item, locale)}
                  </p>
                )}
                {!item.available && (
                  <p className="mt-1 text-sm font-medium text-red-400">
                    {locale === 'fr' ? 'Épuisé' : 'Sold out'}
                  </p>
                )}
              </div>
            </button>
            <div className="absolute right-3 top-3">
              {item.option_groups.length > 0 ? (
                <button
                  onClick={() => setSelected(item)}
                  aria-label={t('addToCart')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-neutral-900 shadow-md transition hover:bg-neutral-200"
                >
                  +
                </button>
              ) : (
                <QuickAddButton
                  slug={item.slug}
                  label={t('addToCart')}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ItemModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
