'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export interface CartOption {
  group_fr: string;
  option_fr: string;
  price_delta: number;
}

export interface CartLine {
  slug: string;
  qty: number;
  options: CartOption[];
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  add: (slug: string, qty?: number, options?: CartOption[]) => void;
  remove: (slug: string, options?: CartOption[]) => void;
  setQty: (slug: string, qty: number, options?: CartOption[]) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'tlj-cart';

function lineKey(slug: string, options: CartOption[]): string {
  return `${slug}::${JSON.stringify(options)}`;
}

export function CartProvider({children}: {children: React.ReactNode}) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 구버전 데이터(옵션 없음) 호환
        setLines(
          parsed.map((l: {slug: string; qty: number; options?: CartOption[]}) => ({
            slug: l.slug,
            qty: l.qty,
            options: l.options || []
          }))
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add = useCallback(
    (slug: string, qty = 1, options: CartOption[] = []) => {
      const key = lineKey(slug, options);
      setLines((prev) => {
        const idx = prev.findIndex(
          (l) => lineKey(l.slug, l.options) === key
        );
        if (idx >= 0) {
          return prev.map((l, i) =>
            i === idx ? {...l, qty: Math.min(99, l.qty + qty)} : l
          );
        }
        return [...prev, {slug, qty, options}];
      });
    },
    []
  );

  const remove = useCallback((slug: string, options: CartOption[] = []) => {
    const key = lineKey(slug, options);
    setLines((prev) =>
      prev.filter((l) => lineKey(l.slug, l.options) !== key)
    );
  }, []);

  const setQty = useCallback(
    (slug: string, qty: number, options: CartOption[] = []) => {
      const key = lineKey(slug, options);
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => lineKey(l.slug, l.options) !== key)
          : prev.map((l) =>
              lineKey(l.slug, l.options) === key
                ? {...l, qty: Math.min(99, qty)}
                : l
            )
      );
    },
    []
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    return {lines, count, add, remove, setQty, clear};
  }, [lines, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
