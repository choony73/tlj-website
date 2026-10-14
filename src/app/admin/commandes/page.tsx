import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {listOrders} from '@/lib/orders';
import OrdersTable from '@/components/admin/OrdersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  if (!(await getSession())) redirect('/admin/login');
  const orders = await listOrders(100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <Link
          href="/admin"
          className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-100"
        >
          대시보드
        </Link>
      </div>
      <OrdersTable initial={orders} />
    </div>
  );
}
