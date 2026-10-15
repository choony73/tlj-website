import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickAddButton from '@/components/cart/QuickAddButton';
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
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600 hover:shadow-lg"
            >
              <Link href={`/menu/${item.slug}`} className="block">
                <div className="relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={itemName(item, locale)}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-neutral-800" />
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-neutral-950">
                    {formatPrice(item.price_cad, locale)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white">
                    {itemName(item, locale)}
                  </p>
                  {itemDescription(item, locale) && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                      {itemDescription(item, locale)}
                    </p>
                  )}
                  {!item.available && (
                    <p className="mt-1 text-sm font-medium text-red-400">
                      {locale === 'fr' ? 'Épuisé' : 'Sold out'}
                    </p>
                  )}
                </div>
              </Link>
              <div className="absolute right-3 top-3">
                <QuickAddButton
                  slug={item.slug}
                  label={
                    locale === 'fr' ? 'Ajouter au panier' : 'Add to cart'
                  }
                />
              </div>
            </div>
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
