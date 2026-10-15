'use client';

import {useState} from 'react';
import {useCart} from './CartProvider';
import CartDrawer from './CartDrawer';

export default function CartButton() {
  const {count} = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-full border border-neutral-600 px-3 py-1 text-sm font-semibold text-white hover:bg-neutral-800"
        aria-label="Panier"
      >
        🛒
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
