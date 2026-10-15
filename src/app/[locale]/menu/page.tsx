import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getCategories, getItemsByCategory, categoryName} from '@/lib/menu';

export default async function MenuPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('menu');
  const categories = await getCategories();
  // 카테고리 대표 이미지: 각 카테고리의 첫 번째 메뉴 이미지
  const covers = await Promise.all(
    categories.map(async (cat) => {
      const items = await getItemsByCategory(cat.slug);
      return items.find((i) => i.image)?.image || null;
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-neutral-600">{t('subtitle')}</p>

      <h2 className="mt-10 text-xl font-semibold">{t('categories')}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/menu/${cat.slug}`}
            className="overflow-hidden rounded-2xl border transition hover:border-red-700 hover:shadow-md"
          >
            {covers[idx] && (
              <img
                src={covers[idx]!}
                alt={categoryName(cat, locale)}
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            )}
            <div className="p-6">
              <p className="text-lg font-semibold">
                {categoryName(cat, locale)}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {cat.item_count} {t('items')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
