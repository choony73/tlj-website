'use client';

import {useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';

const FILTER_KEYS = ['all', 'restaurant', 'dishes', 'atmosphere'] as const;

export default function GaleriePage() {
  const t = useTranslations('gallery');
  const locale = useLocale();
  const [filter, setFilter] = useState<(typeof FILTER_KEYS)[number]>('all');

  const filters = t.raw('filters') as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-neutral-600">{t('subtitle')}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_KEYS.map((key, i) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === key
                ? 'bg-neutral-900 text-white'
                : 'border hover:bg-neutral-100'
            }`}
          >
            {filters[i]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({length: 6}).map((_, i) => (
          <div
            key={`${filter}-${i}`}
            className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-sm text-neutral-500"
          >
            {t('empty')}
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        {locale === 'fr'
          ? 'Les photos seront gérables depuis la page administrateur.'
          : 'Photos will be manageable from the admin page.'}
      </p>
    </div>
  );
}
