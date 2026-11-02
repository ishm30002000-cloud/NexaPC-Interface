import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartLine } from '@/lib/cart-totals';
import { computeTotals, maxQuantityFor, type CartTotals } from '@/lib/cart-totals';
import { getProductsSync } from '@/services/products';
import { CART_KEY, readCart, writeCart } from './cart-storage';

interface CartContextValue {
  lines: CartLine[];
  totals: CartTotals;
  count: number;
  /** Set when stored data was unreadable and has been reset. */
  recovered: boolean;
  dismissRecovered: () => void;
  storageFailed: boolean;
  add: (productId: string, quantity?: number) => { added: number; capped: boolean };
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => { line: CartLine; index: number } | null;
  restore: (line: CartLine, index: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function capFor(productId: string) {
  const p = getProductsSync().find((x) => x.id === productId);
  return p ? maxQuantityFor(p) : 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const initial = useRef(readCart());
  const [lines, setLines] = useState<CartLine[]>(initial.current.lines);
  const [recovered, setRecovered] = useState(initial.current.corrupt);
  const [storageFailed, setStorageFailed] = useState(false);
  const skipWrite = useRef(false);

  useEffect(() => {
    if (initial.current.corrupt) writeCart(initial.current.lines);
  }, []);

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    setStorageFailed(!writeCart(lines));
  }, [lines]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CART_KEY && e.key !== null) return;
      const next = readCart();
      skipWrite.current = true;
      setLines(next.lines);
      if (next.corrupt) setRecovered(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const linesRef = useRef(lines);
  linesRef.current = lines;

  const add = useCallback((productId: string, quantity = 1) => {
    const cap = capFor(productId);
    const current = linesRef.current.find((l) => l.productId === productId)?.quantity ?? 0;
    const target = Math.min(cap, current + quantity);
    const added = Math.max(0, target - current);
    if (added > 0) {
      setLines((prev) =>
        prev.some((l) => l.productId === productId)
          ? prev.map((l) => (l.productId === productId ? { ...l, quantity: target } : l))
          : [...prev, { productId, quantity: target }],
      );
    }
    return { added, capped: current + quantity > cap };
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(1, Math.min(capFor(productId), Math.floor(quantity)));
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)));
  }, []);

  const remove = useCallback((productId: string) => {
    const index = linesRef.current.findIndex((l) => l.productId === productId);
    if (index < 0) return null;
    const line = linesRef.current[index];
    setLines((prev) => prev.filter((l) => l.productId !== productId));
    return { line, index };
  }, []);

  const restore = useCallback((line: CartLine, index: number) => {
    setLines((prev) => {
      if (prev.some((l) => l.productId === line.productId)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, line);
      return next;
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totals = computeTotals(lines, getProductsSync());
    return {
      lines,
      totals,
      count: totals.itemCount,
      recovered,
      dismissRecovered: () => setRecovered(false),
      storageFailed,
      add,
      setQuantity,
      remove,
      restore,
      clear,
    };
  }, [lines, recovered, storageFailed, add, setQuantity, remove, restore, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
