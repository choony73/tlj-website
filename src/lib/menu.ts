import data from '@/data/menu.json';

export interface Category {
  slug: string;
  name_fr: string;
  name_en: string;
  item_count: number;
}

export interface MenuItem {
  slug: string;
  category: string;
  name_fr: string;
  name_en: string | null;
  price_cad: number;
  description_fr: string | null;
  description_en: string | null;
  available: boolean;
}

export const categories: Category[] = data.categories;
export const menuItems: MenuItem[] = data.items;

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getItem(slug: string): MenuItem | undefined {
  return menuItems.find((i) => i.slug === slug);
}

export function getItemsByCategory(categorySlug: string): MenuItem[] {
  return menuItems.filter((i) => i.category === categorySlug);
}

export function itemName(item: MenuItem, locale: string): string {
  if (locale === 'en' && item.name_en) return item.name_en;
  return item.name_fr;
}

export function itemDescription(
  item: MenuItem,
  locale: string
): string | null {
  if (locale === 'en' && item.description_en) return item.description_en;
  return item.description_fr;
}

export function categoryName(cat: Category, locale: string): string {
  return locale === 'en' ? cat.name_en : cat.name_fr;
}

export function formatPrice(cad: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(cad);
}
