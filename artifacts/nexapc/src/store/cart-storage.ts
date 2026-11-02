import type { CartLine } from '@/lib/cart-totals';

/** Versioned key. Cart stores ONLY product id + quantity. */
export const CART_KEY = 'nexapc.cart.v1';
const MAX_LINE_QTY = 99;

export function parseCart(raw: string | null): { lines: CartLine[]; corrupt: boolean } {
  if (raw == null) return { lines: [], corrupt: false };
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object' || (data as { v?: unknown }).v !== 1 || !Array.isArray((data as { lines?: unknown }).lines)) {
      return { lines: [], corrupt: true };
    }
    const merged = new Map<string, number>();
    for (const l of (data as { lines: unknown[] }).lines) {
      if (!l || typeof l !== 'object') continue;
      const { productId, quantity } = l as Record<string, unknown>;
      if (typeof productId !== 'string' || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue;
      merged.set(productId, Math.min(MAX_LINE_QTY, (merged.get(productId) ?? 0) + quantity));
    }
    return { lines: [...merged].map(([productId, quantity]) => ({ productId, quantity })), corrupt: false };
  } catch {
    return { lines: [], corrupt: true };
  }
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify({ v: 1, lines });
}

export function readCart(): { lines: CartLine[]; corrupt: boolean } {
  try {
    return parseCart(window.localStorage.getItem(CART_KEY));
  } catch {
    return { lines: [], corrupt: false };
  }
}

export function writeCart(lines: CartLine[]): boolean {
  try {
    window.localStorage.setItem(CART_KEY, serializeCart(lines));
    return true;
  } catch {
    return false;
  }
}
