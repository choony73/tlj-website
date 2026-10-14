import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getCategories, categoryName} from '@/lib/menu';

export default async function MenuPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('menu');
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-neutral-600">{t('subtitle')}</p>

      <h2 className="mt-10 text-xl font-semibold">{t('categories')}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/menu/${cat.slug}`}
            className="rounded-2xl border p-6 transition hover:border-red-700 hover:shadow-md"
          >
            <p className="text-lg font-semibold">{categoryName(cat, locale)}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {cat.item_count} {t('items')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
