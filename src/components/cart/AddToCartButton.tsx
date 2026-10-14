'use client';

import {useState} from 'react';
import {useCart} from './CartProvider';

export default function AddToCartButton({
  slug,
  label,
  addedLabel
}: {
  slug: string;
  label: string;
  addedLabel: string;
}) {
  const {add} = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add(slug, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={onClick}
      className={`rounded-full px-6 py-3 font-semibold text-white transition ${
        added ? 'bg-green-700' : 'bg-red-700 hover:bg-red-800'
      }`}
    >
      {added ? addedLabel : label}
    </button>
  );
}
