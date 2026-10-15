'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import AddToCartButton from './AddToCartButton';
import ItemModal from './ItemModal';
import type {MenuItem} from '@/lib/menu';

export default function ItemDetailOrder({item}: {item: MenuItem}) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  if (item.option_groups.length === 0) {
    return (
      <AddToCartButton
        slug={item.slug}
        label={t('addToCart')}
        addedLabel={locale === 'fr' ? 'Ajouté ✓' : 'Added ✓'}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-amber-400 px-6 py-3 font-bold text-neutral-950 hover:bg-amber-300"
      >
        {t('options')} • {t('addToCart')}
      </button>
      {open && <ItemModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
