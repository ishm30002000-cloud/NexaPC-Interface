import type { Product } from '@/data/products';

/** English-only presentation helpers shared by the storefront. */
export type Locale = 'en';
const englishCopy = (english: string) => english;
const presentation = { locale: 'en' as const, t: englishCopy };

export function useLocale() {
  return presentation;
}

export function productCopy(product: Product, _locale: Locale = 'en') {
  return product;
}
