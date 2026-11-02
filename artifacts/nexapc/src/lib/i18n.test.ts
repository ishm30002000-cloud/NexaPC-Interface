import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import { formatMoney } from './money';
import { productCopy, useLocale } from './i18n';

describe('English-only storefront', () => {
  it('preserves the original English catalog without changing product identity', () => {
    const source = products.find((product) => product.slug === 'samsung-990-pro-2tb')!;
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
