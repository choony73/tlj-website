import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function AProposPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  const values = t.raw('values') as {t: string; d: string}[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-700">
        {t('title')}
      </p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-neutral-600">{t('intro')}</p>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-2xl font-semibold">{t('storyTitle')}</h2>
        <p className="mt-3 leading-relaxed text-neutral-700">{t('story')}</p>
      </div>

      <h2 className="mt-12 text-2xl font-semibold">{t('valuesTitle')}</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.t} className="rounded-2xl border p-6">
            <p className="font-semibold">{v.t}</p>
            <p className="mt-1 text-sm text-neutral-600">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/menu"
          className="rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
        >
          {locale === 'fr' ? 'Découvrir le menu' : 'Discover the menu'}
        </Link>
      </div>
    </div>
  );
}
