'use client';

import {useRouter} from 'next/navigation';
import {formatPrice} from '@/lib/menu';

interface Props {
  slug: string;
  name_fr: string;
  price_cad: number;
  available: boolean;
}

export default function MenuRow({slug, name_fr, price_cad, available}: Props) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/admin/menu/${slug}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({available: !available})
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm(`"${name_fr}" 메뉴를 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/menu/${slug}`, {method: 'DELETE'});
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <div className={!available ? 'opacity-50' : ''}>
        <p className="font-medium">{name_fr}</p>
        <p className="text-sm text-neutral-500">
          {formatPrice(price_cad, 'fr')}
          {!available && ' · 품절'}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={`/admin/menu/${slug}`}
          className="rounded-full border px-3 py-1 text-sm hover:bg-neutral-100"
        >
          수정
        </a>
        <button
          onClick={toggle}
          className="rounded-full border px-3 py-1 text-sm hover:bg-neutral-100"
        >
          {available ? '품절 처리' : '판매 재개'}
        </button>
        <button
          onClick={remove}
          className="rounded-full border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
