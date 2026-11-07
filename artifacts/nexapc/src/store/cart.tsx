import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { computeTotals, maxQuantityFor, type CartLine, type CartTotals } from '@/lib/cart-totals';
import { CART_KEY, readCart, writeCart } from './cart-storage';
import { useAuth } from './auth';
import { useCatalog } from './catalog';
import { loadSavedCart, saveCart } from '@/services/customer';
import { backendError } from '@/lib/supabase';

interface CartContextValue {
  lines: CartLine[]; totals: CartTotals; count: number;
  recovered: boolean; dismissRecovered: () => void; storageFailed: boolean;
  ready: boolean; syncing: boolean; syncError: string | null; retrySync: () => void;
  flush: () => Promise<void>; acceptSubmitted: () => void;
  add: (id: string, quantity?: number) => { added: number; capped: boolean };
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => { line: CartLine; index: number } | null;
  restore: (line: CartLine, index: number) => void;
  clear: () => void;
}
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, session, loading: authLoading } = useAuth();
  const { products, loading: catalogLoading } = useCatalog();
  const initial = useRef(readCart());
  const [lines, setLines] = useState(initial.current.lines);
  const [recovered, setRecovered] = useState(initial.current.corrupt);
  const [storageFailed, setStorageFailed] = useState(false);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const uid = user?.id ?? null;
  const state = useRef({ uid, token: session?.access_token, lines, ready: false, epoch: 0, pending: 0, error: null as string | null });
  state.current.uid = uid;
  state.current.token = session?.access_token;
  const ready = !authLoading && !catalogLoading && loadedOwner === (uid ?? 'guest');
  state.current.ready = ready;
  const queue = useRef<Promise<void>>(Promise.resolve());
  const catalogRef = useRef(products);
  catalogRef.current = products;

  // Never save a previous customer's in-memory cart to the next session.
  useEffect(() => {
    if (authLoading) return;
    const epoch = ++state.current.epoch;
    let alive = true;
    setLoadedOwner(null);
    setSyncError(null);
    state.current.error = null;
    state.current.pending = 0;
    queue.current = Promise.resolve();
    const put = (next: CartLine[]) => { state.current.lines = next; setLines(next); };
    if (!uid) {
      put(readCart().lines);
      setLoadedOwner('guest');
      setSyncing(false);
      return;
    }
    put([]);
    setSyncing(true);
    const token = state.current.token!;
    (async () => {
      const guest = readCart().lines;
      if (guest.length) await saveCart(guest, token, true);
      const saved = await loadSavedCart(token);
      if (!alive || state.current.epoch !== epoch) return;
      if (guest.length) setStorageFailed(!writeCart([]));
      put(saved);
      setLoadedOwner(uid);
    })().catch(e => {
      if (alive && state.current.epoch === epoch) {
        state.current.error = backendError(e); setSyncError(backendError(e));
      }
    }).finally(() => { if (alive && state.current.epoch === epoch) setSyncing(false); });
    return () => { alive = false; };
  }, [uid, authLoading, nonce]);

  const persist = useCallback((snapshot: CartLine[]) => {
    const s = state.current;
    if (!s.uid || !s.token) { setStorageFailed(!writeCart(snapshot)); return; }
    const epoch = s.epoch;
    const token = s.token;
    s.pending++;
    setSyncing(true);
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (state.current.epoch !== epoch) return;
      await saveCart(snapshot, token);
      const canonical = await loadSavedCart(token);
      if (state.current.epoch === epoch) {
        if (state.current.lines === snapshot) { state.current.lines = canonical; setLines(canonical); }
        state.current.error = null; setSyncError(null);
      }
    }).catch(e => {
      if (state.current.epoch === epoch) { state.current.error = backendError(e); setSyncError(backendError(e)); }
    }).finally(() => {
      if (state.current.epoch === epoch) { state.current.pending--; setSyncing(state.current.pending > 0); }
    });
  }, []);
  const commit = useCallback((next: CartLine[]) => {
    if (!state.current.ready) return;
    state.current.lines = next;
    setLines(next);
    persist(next);
  }, [persist]);

  // Other tabs/devices have a freshness path; never overwrite unsaved changes.
  useEffect(() => {
    if (!uid || !ready) return;
    let alive = true;
    const refresh = async () => {
      const s = state.current;
      if (s.pending || s.error || !s.token) return;
      const epoch = s.epoch;
      const pendingAtStart = queue.current;
      try {
        const next = await loadSavedCart(s.token);
        if (alive && epoch === s.epoch && !s.pending && !s.error && queue.current === pendingAtStart) {
          s.lines = next; setLines(next);
        }
      } catch (e) { if (alive) setSyncError(backendError(e)); }
    };
    const focus = () => { void refresh(); };
    const timer = window.setInterval(focus, 30_000);
    window.addEventListener('focus', focus);
    return () => { alive = false; clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [uid, ready]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (state.current.uid || (e.key !== CART_KEY && e.key !== null)) return;
      const next = readCart();
      state.current.lines = next.lines;
      setLines(next.lines);
      if (next.corrupt) setRecovered(true);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const capFor = useCallback((id: string) => {
    const p = catalogRef.current.find(p => p.id === id);
    return !p || p.isPlaceholder ? 0 : Math.min(99, maxQuantityFor(p));
  }, []);
  const add = useCallback((id: string, quantity = 1) => {
    if (!state.current.ready) return { added: 0, capped: false };
    const current = state.current.lines.find(l => l.productId === id)?.quantity ?? 0;
    const target = Math.min(capFor(id), current + Math.max(1, Math.floor(quantity)));
    const added = Math.max(0, target - current);
    if (added) commit(current ? state.current.lines.map(l => l.productId === id ? { ...l, quantity: target } : l) : [...state.current.lines, { productId: id, quantity: target }]);
    return { added, capped: target < current + quantity };
  }, [capFor, commit]);
  const setQuantity = useCallback((id: string, qty: number) => {
    const q = Math.max(1, Math.min(capFor(id), Math.floor(qty)));
    commit(state.current.lines.map(l => l.productId === id ? { ...l, quantity: q } : l));
  }, [commit, capFor]);
  const remove = useCallback((id: string) => {
    if (!state.current.ready) return null;
    const index = state.current.lines.findIndex(l => l.productId === id);
    if (index < 0) return null;
    const line = state.current.lines[index];
    commit(state.current.lines.filter(l => l.productId !== id));
    return { line, index };
  }, [commit]);
  const restore = useCallback((line: CartLine, index: number) => {
    if (state.current.lines.some(l => l.productId === line.productId)) return;
    const next = [...state.current.lines];
    next.splice(index, 0, line);
    commit(next);
  }, [commit]);
  const clear = useCallback(() => commit([]), [commit]);
  const acceptSubmitted = useCallback(() => {
    // SQL has already cleared this cart in the order transaction.
    state.current.lines = []; setLines([]);
  }, []);
  const flush = useCallback(async () => {
    await queue.current;
    if (!state.current.ready || state.current.error) throw new Error(state.current.error ?? 'Your cart is still loading.');
  }, []);
  const retrySync = () => {
    if (!ready) setNonce(n => n + 1);
    else persist(state.current.lines);
  };
  const totals = useMemo(() => computeTotals(lines, products), [lines, products]);
  return <CartContext.Provider value={{
    lines, totals, count: totals.itemCount, recovered, dismissRecovered: () => setRecovered(false),
    storageFailed, ready, syncing, syncError, retrySync, flush, acceptSubmitted, add, setQuantity, remove, restore, clear,
  }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('CartProvider is missing');
  return value;
}
