import { describe, expect, it } from 'vitest';
import type { Product } from '@/data/products';
import { formatMoney } from './money';
import { productCopy, useLocale } from './i18n';

describe('English-only storefront', () => {
  it('preserves the original English catalog without changing product identity', () => {
    const source: Product = {
      id: 'test-product', slug: 'test-product', name: 'Test product', brand: 'Test',
      category: 'ssd-storage', priceFils: null, stock: null, images: [],
      shortDescription: 'Test copy', description: 'English test copy',
      specs: [{ label: 'Test specification', value: null }], featured: false,
    };
    expect(productCopy(source, 'en')).toEqual(source);
  });

  it('formats KWD to three English fraction digits', () => {
    expect(formatMoney(12750, 'en')).toContain('12.750');
  });

  it('always presents English labels', () => {
    expect(useLocale().locale).toBe('en');
    expect(useLocale().t('Add to Cart')).toBe('Add to Cart');
  });
});
