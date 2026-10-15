import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import AddToCartButton from '@/components/cart/AddToCartButton';
import {
  categorySlugs,
  menuItemSlugs,
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
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/menu" className="text-sm text-red-700 hover:underline">
          ← {t('backToMenu')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {categoryName(category, locale)}
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/menu/${item.slug}`}
              className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-red-700 hover:shadow-md"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={itemName(item, locale)}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{itemName(item, locale)}</p>
                {itemDescription(item, locale) && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                    {itemDescription(item, locale)}
                  </p>
                )}
                {!item.available && (
                  <p className="mt-1 text-sm font-medium text-red-700">
                    {locale === 'fr' ? 'Épuisé' : 'Sold out'}
                  </p>
                )}
              </div>
              <p className="shrink-0 font-bold">
                {formatPrice(item.price_cad, locale)}
              </p>
            </Link>
          ))}
        </div>
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
          <AddToCartButton
            slug={item.slug}
            label={locale === 'fr' ? 'Ajouter au panier' : 'Add to cart'}
            addedLabel={locale === 'fr' ? 'Ajouté ✓' : 'Added ✓'}
          />
        </div>
      </div>
    );
  }

  notFound();
}
