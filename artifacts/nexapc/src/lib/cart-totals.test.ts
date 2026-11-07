import { describe, expect, it } from 'vitest';
import type { Product } from '@/data/products';
import { computeTotals, lineSubtotal, maxQuantityFor, PREVIEW_QTY_CAP } from './cart-totals';
import { formatMoney, kwdToFils } from './money';
import { parseCart } from '@/store/cart-storage';

const mk = (id: string, priceFils: number | null, stock: number | null = null): Product => ({
  id, slug: id, name: id, brand: 'B', category: 'memory', priceFils, stock, images: [],
  shortDescription: '', description: '', specs: [], featured: false,
});

describe('cart totals (integer fils)', () => {
  it('uses saved sample prices in totals while preserving their testing status', () => {
    const sample = { ...mk('sample', 54900), isSamplePrice: true };
    const totals = computeTotals([{ productId: 'sample', quantity: 2 }], [sample]);
    expect(totals.subtotalFils).toBe(109800);
    expect(totals.hasSamplePrices).toBe(true);
    expect(formatMoney(totals.totalFils!)).toContain('109.800');
    expect(computeTotals([{ productId: 'real', quantity: 1 }], [mk('real', 1000)]).hasSamplePrices).toBe(false);
  });
  it('sums known prices without float drift', () => {
    const cat = [mk('a', 100), mk('b', 200)];
    const t = computeTotals([{ productId: 'a', quantity: 3 }, { productId: 'b', quantity: 1 }], cat);
    expect(t.subtotalFils).toBe(500);
    expect(t.totalFils).toBe(500);
    expect(t.hasPendingPrices).toBe(false);
    expect(formatMoney(t.totalFils!)).toContain('0.500');
  });
  it('never reports a total when any price is missing', () => {
    const t = computeTotals([{ productId: 'a', quantity: 1 }, { productId: 'x', quantity: 2 }], [mk('a', 12345), mk('x', null)]);
    expect(t.hasPendingPrices).toBe(true);
    expect(t.subtotalFils).toBeNull();
    expect(t.totalFils).toBeNull();
    expect(t.knownSubtotalFils).toBe(12345);
    expect(t.itemCount).toBe(3);
  });
  it('drops lines for products no longer in catalog', () => {
    const t = computeTotals([{ productId: 'gone', quantity: 1 }], [mk('a', 1)]);
    expect(t.lines).toHaveLength(0);
    expect(t.missingIds).toEqual(['gone']);
  });
  it('rejects non-integer money', () => {
    expect(() => lineSubtotal(1.5, 2)).toThrow();
  });
  it('max quantity uses stock or preview cap', () => {
    expect(maxQuantityFor({ stock: 3 })).toBe(3);
    expect(maxQuantityFor({ stock: null })).toBe(PREVIEW_QTY_CAP);
  });
  it('parses KWD input to fils', () => {
    expect(kwdToFils('12.5')).toBe(12500);
    expect(kwdToFils('0.001')).toBe(1);
    expect(kwdToFils('1.2345')).toBeNull();
    expect(kwdToFils('abc')).toBeNull();
  });
});

describe('parseCart', () => {
  it('handles corrupt storage', () => {
    expect(parseCart('{not json').lines).toEqual([]);
    expect(parseCart('{not json').corrupt).toBe(true);
    expect(parseCart(null).corrupt).toBe(false);
  });
  it('keeps only valid lines and merges duplicates', () => {
    const raw = JSON.stringify({ v: 1, lines: [{ productId: 'a', quantity: 2 }, { productId: 'a', quantity: 1 }, { productId: 3, quantity: 1 }, { productId: 'b', quantity: -1 }] });
    expect(parseCart(raw).lines).toEqual([{ productId: 'a', quantity: 3 }]);
  });
});
