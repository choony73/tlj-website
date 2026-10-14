import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {getCategories, getMenuItems, categoryName} from '@/lib/menu';
import MenuRow from '@/components/admin/MenuRow';

export const dynamic = 'force-dynamic';

export default async function AdminMenuList() {
  if (!(await getSession())) redirect('/admin/login');
  const [categories, items] = await Promise.all([
    getCategories(),
    getMenuItems()
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">메뉴 관리 ({items.length}개)</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/menu/new"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            + 새 메뉴
          </Link>
          <Link
            href="/admin"
            className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-100"
          >
            대시보드
          </Link>
        </div>
      </div>

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat.slug);
        if (catItems.length === 0) return null;
        return (
          <div key={cat.slug} className="mt-8">
            <h2 className="text-lg font-semibold">
              {categoryName(cat, 'fr')} ({catItems.length})
            </h2>
            <div className="mt-2 rounded-2xl border px-4">
              {catItems.map((item) => (
                <MenuRow
                  key={item.slug}
                  slug={item.slug}
                  name_fr={item.name_fr}
                  price_cad={item.price_cad}
                  available={item.available}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
