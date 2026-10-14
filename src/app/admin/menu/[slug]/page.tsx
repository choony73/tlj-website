import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {getCategories, getItem} from '@/lib/menu';
import MenuForm from '@/components/admin/MenuForm';

export const dynamic = 'force-dynamic';

export default async function AdminMenuEdit({
  params
}: {
  params: Promise<{slug: string}>;
}) {
  if (!(await getSession())) redirect('/admin/login');
  const {slug} = await params;
  const [categories, item] = await Promise.all([
    getCategories(),
    getItem(slug)
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/admin/menu"
        className="text-sm text-neutral-500 hover:underline"
      >
        ← 메뉴 목록
      </Link>
      <h1 className="mt-2 text-2xl font-bold">메뉴 수정</h1>
      <div className="mt-6">
        <MenuForm categories={categories} initial={item} />
      </div>
    </div>
  );
}
