import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function LivraisonPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('delivery');

  const steps = t.raw('steps') as {t: string; d: string}[];
  const zones = t.raw('zones') as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-700">
        {t('subtitle')}
      </p>
      <h1 className="mt-2 text-3xl font-bold">{t('title')}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border p-6">
            <p className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-lg font-bold text-white">
              {i + 1}
            </p>
            <p className="mt-4 font-semibold">{s.t}</p>
            <p className="mt-1 text-sm text-neutral-600">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-neutral-50 p-6">
        <p className="font-semibold">{t('zonesTitle')}</p>
        <ul className="mt-2 list-disc pl-5 text-neutral-700">
          {zones.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-neutral-600">{t('zonesNote')}</p>
        <p className="mt-2 text-sm font-medium">{t('secure')}</p>
      </div>

      <div className="mt-8">
        <Link
          href="/menu"
          className="rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
        >
          {locale === 'fr' ? 'Voir le menu' : 'View the menu'}
        </Link>
      </div>
    </div>
  );
}
