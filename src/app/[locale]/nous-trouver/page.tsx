import {getTranslations, setRequestLocale} from 'next-intl/server';

const HOURS = [
  'closed',
  '11h30 – 20h00',
  '11h30 – 20h00',
  '11h30 – 20h00',
  '11h30 – 20h00',
  '11h30 – 20h00',
  '11h30 – 20h00'
];

export default async function NousTrouverPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('findUs');
  const tCommon = await getTranslations('common');

  const days = t.raw('days') as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <p className="font-semibold">{t('addressTitle')}</p>
          <p className="mt-2">Tous Les Jours Sushi & Korean</p>
          <p className="text-neutral-600">{tCommon('address')}</p>
          <p className="mt-2 text-neutral-600">
            {tCommon('phone')} · {tCommon('email')}
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <p className="font-semibold">{t('hoursTitle')}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {days.map((day, i) => (
              <li key={day} className="flex justify-between">
                <span>{day}</span>
                <span className="text-neutral-600">
                  {HOURS[i] === 'closed' ? t('closed') : HOURS[i]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border p-6">
        <p className="font-semibold">{t('parkingTitle')}</p>
        <p className="mt-2 text-sm text-neutral-600">{t('parking')}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <iframe
          title="map"
          src="https://www.google.com/maps?q=11+Rue+Mill,+Shediac,+NB&output=embed"
          className="h-80 w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
