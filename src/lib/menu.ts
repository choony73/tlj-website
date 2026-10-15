// 메뉴 데이터 접근 레이어
// - DATABASE_URL이 설정되어 있으면 Postgres(Neon)에서 읽고,
// - 없으면 src/data/menu.json에서 읽습니다 (로컬/미리보기용).
import {sql, isDbConfigured} from './db';
import data from '@/data/menu.json';

export interface Category {
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
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
  image: string | null;
  available: boolean;
}

const jsonCategories: Category[] = data.categories;
const jsonItems: MenuItem[] = data.items as MenuItem[];

export async function getCategories(): Promise<Category[]> {
  if (isDbConfigured && sql) {
    const rows = await sql`
      SELECT c.slug, c.name_fr, c.name_en, c.description_fr, c.description_en,
             COUNT(i.slug)::int AS item_count
      FROM categories c
      LEFT JOIN menu_items i ON i.category = c.slug
      GROUP BY c.slug
      ORDER BY c.sort_order
    `;
    return rows as unknown as Category[];
  }
  return jsonCategories;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  if (isDbConfigured && sql) {
    const rows = await sql`
      SELECT slug, category, name_fr, name_en,
             price_cad::float AS price_cad,
             description_fr, description_en, image, available
      FROM menu_items
      ORDER BY category, sort_order
    `;
    return rows as unknown as MenuItem[];
  }
  return jsonItems;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug);
}

export async function getItem(slug: string): Promise<MenuItem | undefined> {
  const items = await getMenuItems();
  return items.find((i) => i.slug === slug);
}

export async function getItemsByCategory(
  categorySlug: string
): Promise<MenuItem[]> {
  const items = await getMenuItems();
  return items.filter((i) => i.category === categorySlug);
}

// ---- 정적 생성용 (빌드 시점 slug 목록) ----
export const categorySlugs: string[] = jsonCategories.map((c) => c.slug);
export const menuItemSlugs: string[] = jsonItems.map((i) => i.slug);

// ---- 표시 헬퍼 (동기) ----
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

export function categoryDescription(
  cat: Category,
  locale: string
): string | null {
  const d = locale === 'en' ? cat.description_en : cat.description_fr;
  return d || null;
}

export function formatPrice(cad: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(cad);
}
