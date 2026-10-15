'use client';

import {useState} from 'react';
import {useCart} from './CartProvider';

// 사진 카드 우상단의 원형 "+" 바로담기 버튼
export default function QuickAddButton({
  slug,
  label
}: {
  slug: string;
  label: string;
}) {
  const {add} = useCart();
  const [added, setAdded] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(slug, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold shadow-md transition ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-white text-neutral-900 hover:bg-neutral-200'
      }`}
    >
      {added ? '✓' : '+'}
    </button>
  );
}
