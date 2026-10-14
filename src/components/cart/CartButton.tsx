'use client';

import {Link} from '@/i18n/navigation';
import {useCart} from './CartProvider';

export default function CartButton() {
  const {count} = useCart();
  return (
    <Link
      href="/commander"
      className="relative rounded-full border border-neutral-600 px-3 py-1 text-sm font-semibold text-white hover:bg-neutral-800"
      aria-label="Panier"
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
