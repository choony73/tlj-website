import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import ItemDetailOrder from '@/components/cart/ItemDetailOrder';
import CategoryGrid from '@/components/cart/CategoryGrid';
import {
  categorySlugs,
  menuItemSlugs,
  categoryDescription,
  categoryName,
  formatPrice,
  getCategory,
  getItem,
  getItemsByCategory,
  itemDescription,
  itemName
} from '@/lib/menu';

export function generateStaticParams() {
  const slugs = [...categorySlugs, ...menuItemSlugs];
  return slugs.map((slug) => ({slug}));
}

export default async function MenuSlugPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('menu');

  const category = await getCategory(slug);
  if (category) {
    const items = await getItemsByCategory(slug);
    const catDesc = categoryDescription(category, locale);
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/menu" className="text-sm text-red-700 hover:underline">
          ← {t('backToMenu')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {categoryName(category, locale)}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {items.length} {t('items')}
        </p>
        {catDesc && (
          <p className="mt-4 max-w-3xl text-neutral-400">{catDesc}</p>
        )}
        <CategoryGrid items={items} />
      </div>
    );
  }

  const item = await getItem(slug);
  if (item) {
    const cat = await getCategory(item.category);
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href={cat ? `/menu/${cat.slug}` : '/menu'}
          className="text-sm text-red-700 hover:underline"
        >
          ← {t('backToMenu')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {itemName(item, locale)}
        </h1>
        {(item.is_vegetarian || item.is_spicy) && (
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
        )}
        {cat && (
          <p className="mt-1 text-sm text-neutral-500">
            {categoryName(cat, locale)}
          </p>
        )}
        {item.image && (
          <img
            src={item.image}
            alt={itemName(item, locale)}
            className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover"
          />
        )}
        {itemDescription(item, locale) && (
          <p className="mt-4 text-neutral-700">
            {itemDescription(item, locale)}
          </p>
        )}
        <p className="mt-6 text-2xl font-bold">
          {formatPrice(item.price_cad, locale)}
        </p>
        <div className="mt-8">
          <ItemDetailOrder item={item} />
        </div>
      </div>
    );
  }

  notFound();
}
