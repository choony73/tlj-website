import Link from 'next/link';
import {getSession} from '@/lib/auth';
import {isDbConfigured} from '@/lib/db';
import {redirect} from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (!(await getSession())) redirect('/admin/login');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">사이트 관리</h1>
      {!isDbConfigured && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-semibold">DB가 연결되지 않았습니다.</p>
          <p className="mt-1 text-neutral-600">
            메뉴를 수정하려면 Postgres 데이터베이스 연결이 필요합니다.
            Vercel 대시보드에서 Postgres를 추가한 뒤 환경변수
            DATABASE_URL을 설정하고 <code>npm run seed</code>를 실행하세요.
            지금은 메뉴를 읽기 전용으로 볼 수 있습니다.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/menu"
          className="rounded-2xl border p-6 transition hover:border-neutral-900 hover:shadow-md"
        >
          <p className="text-lg font-semibold">메뉴 관리</p>
          <p className="mt-1 text-sm text-neutral-500">
            메뉴 추가·수정·가격 변경·품절 표시
          </p>
        </Link>
        <div className="rounded-2xl border border-dashed p-6 text-neutral-400">
          <p className="text-lg font-semibold">콘텐츠 관리</p>
          <p className="mt-1 text-sm">영업시간·공지·갤러리·FAQ (준비 중)</p>
        </div>
      </div>

      <form action="/api/admin/logout" method="POST" className="mt-8">
        <button
          type="submit"
          className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-100"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
