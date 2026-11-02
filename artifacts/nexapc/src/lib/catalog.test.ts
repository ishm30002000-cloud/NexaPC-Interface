import { describe, expect, it } from 'vitest';
import type { Product } from '@/data/products';
import { applyCatalog, filterProducts, filtersFromParams, paramsFromFilters, sortProducts, EMPTY_FILTERS } from './catalog';

const mk = (o: Partial<Product> & { id: string; name: string }): Product => ({
  slug: o.id,
  brand: 'Samsung',
  category: 'ssd-storage',
  priceFils: null,
  stock: null,
  images: [],
  shortDescription: '',
  description: '',
  specs: [],
  featured: false,
  ...o,
});

const list = [
  mk({ id: 'a', name: 'Bravo SSD', priceFils: 30000, stock: 4, featured: false }),
  mk({ id: 'b', name: 'alpha Monitor', brand: 'MSI', category: 'gaming-monitors', priceFils: 99500, stock: 0, featured: true }),
  mk({ id: 'c', name: 'Charlie Cooler', brand: 'Noctua', category: 'pc-cooling', priceFils: null, stock: null }),
  mk({ id: 'd', name: 'Delta SSD', priceFils: 12250, stock: 2, featured: true }),
];

describe('filterProducts', () => {
  it('searches by name case-insensitively', () => {
    expect(filterProducts(list, { ...EMPTY_FILTERS, q: 'ssd' }).map((p) => p.id)).toEqual(['a', 'd']);
  });
  it('combines category, brand and availability with AND', () => {
    const r = filterProducts(list, { ...EMPTY_FILTERS, categories: ['ssd-storage', 'gaming-monitors'], brands: ['MSI'], availability: ['out-of-stock'] });
    expect(r.map((p) => p.id)).toEqual(['b']);
  });
  it('filters availability pending', () => {
    expect(filterProducts(list, { ...EMPTY_FILTERS, availability: ['pending'] }).map((p) => p.id)).toEqual(['c']);
  });
  it('excludes unknown prices from price ranges', () => {
    const r = filterProducts(list, { ...EMPTY_FILTERS, minFils: 12000, maxFils: 30000 });
    expect(r.map((p) => p.id)).toEqual(['a', 'd']);
  });
});

describe('sortProducts', () => {
  it('price ascending keeps unknown last', () => {
    expect(sortProducts(list, 'price-asc').map((p) => p.id)).toEqual(['d', 'a', 'b', 'c']);
  });
  it('price descending keeps unknown last', () => {
    expect(sortProducts(list, 'price-desc').map((p) => p.id)).toEqual(['b', 'a', 'd', 'c']);
  });
  it('name A-Z and Z-A', () => {
    expect(sortProducts(list, 'name-asc').map((p) => p.id)).toEqual(['b', 'a', 'c', 'd']);
    expect(sortProducts(list, 'name-desc').map((p) => p.id)).toEqual(['d', 'c', 'a', 'b']);
  });
  it('featured first, stable', () => {
    expect(sortProducts(list, 'featured').map((p) => p.id)).toEqual(['b', 'd', 'a', 'c']);
  });
  it('applyCatalog filters then sorts', () => {
    expect(applyCatalog(list, { ...EMPTY_FILTERS, q: 'ssd', sort: 'price-desc' }).map((p) => p.id)).toEqual(['a', 'd']);
  });
});

describe('URL params', () => {
  it('round-trips and ignores invalid values', () => {
    const f = { ...EMPTY_FILTERS, q: 'ssd', categories: ['ssd-storage' as const], minFils: 1000, sort: 'name-asc' as const };
    const sp = paramsFromFilters(f);
    expect(filtersFromParams(sp, ['ssd-storage'])).toEqual(f);
    const bad = filtersFromParams(new URLSearchParams('category=nope&sort=zzz&min=-4&availability=x'), ['ssd-storage']);
    expect(bad).toEqual(EMPTY_FILTERS);
  });
});
