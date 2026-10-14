import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {getCategories} from '@/lib/menu';
import MenuForm from '@/components/admin/MenuForm';

export const dynamic = 'force-dynamic';

export default async function AdminMenuNew() {
  if (!(await getSession())) redirect('/admin/login');
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/admin/menu"
        className="text-sm text-neutral-500 hover:underline"
      >
        ← 메뉴 목록
      </Link>
      <h1 className="mt-2 text-2xl font-bold">새 메뉴 추가</h1>
      <div className="mt-6">
        <MenuForm categories={categories} initial={null} />
      </div>
    </div>
  );
}
