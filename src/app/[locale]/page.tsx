import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');
  const tCommon = await getTranslations('common');

  return (
    <div>
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Tous Les Jours Sushi & Korean
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
            {t('subtitle')}
          </p>
          <p className="mt-2 text-sm text-neutral-400">{tCommon('phone')}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/menu"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold hover:bg-white/10"
            >
              {t('ctaMenu')}
            </Link>
            <Link
              href="/commander"
              className="rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
            >
              {t('ctaOrder')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <p className="text-3xl font-bold">10+</p>
            <p className="mt-2 text-neutral-600">ans d'expérience</p>
          </div>
          <div className="rounded-2xl border p-6">
            <p className="text-3xl font-bold">4.8</p>
            <p className="mt-2 text-neutral-600">sur Google · 64 avis</p>
          </div>
          <div className="rounded-2xl border p-6">
            <p className="text-3xl font-bold">15–30 min</p>
            <p className="mt-2 text-neutral-600">prêt pour emporter</p>
          </div>
        </div>
      </section>
    </div>
  );
}
