import type { CategorySlug, Product } from '@/data/products';

export type Availability = 'in-stock' | 'out-of-stock' | 'pending';
export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
  { value: 'pending', label: 'Availability pending' },
];

export function availabilityOf(p: Pick<Product, 'stock'>): Availability {
  if (p.stock == null) return 'pending';
  return p.stock > 0 ? 'in-stock' : 'out-of-stock';
}

export interface CatalogFilters {
  q: string;
  categories: CategorySlug[];
  brands: string[];
  availability: Availability[];
  minFils: number | null;
  maxFils: number | null;
  sort: SortKey;
}

export const EMPTY_FILTERS: CatalogFilters = {
  q: '',
  categories: [],
  brands: [],
  availability: [],
  minFils: null,
  maxFils: null,
  sort: 'featured',
};

/** Pure filter: all active criteria must match (AND across groups, OR within a group). */
export function filterProducts(list: Product[], f: CatalogFilters): Product[] {
  const q = f.q.trim().toLowerCase();
  const priceActive = f.minFils != null || f.maxFils != null;
  return list.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.availability.length && !f.availability.includes(availabilityOf(p))) return false;
    if (priceActive) {
      // Products without a price cannot satisfy a price range.
      if (p.priceFils == null) return false;
      if (f.minFils != null && p.priceFils < f.minFils) return false;
      if (f.maxFils != null && p.priceFils > f.maxFils) return false;
    }
    return true;
  });
}

/** Pure, stable sort. Unknown prices always sort last for price sorts. */
export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const indexed = list.map((p, i) => ({ p, i }));
  const byPrice = (dir: 1 | -1) => (a: { p: Product; i: number }, b: { p: Product; i: number }) => {
    const ap = a.p.priceFils;
    const bp = b.p.priceFils;
    if (ap == null && bp == null) return a.i - b.i;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return (ap - bp) * dir || a.i - b.i;
  };
  const byName = (dir: 1 | -1) => (a: { p: Product; i: number }, b: { p: Product; i: number }) =>
    a.p.name.localeCompare(b.p.name, 'en', { sensitivity: 'base' }) * dir || a.i - b.i;
  switch (sort) {
    case 'price-asc':
      indexed.sort(byPrice(1));
      break;
    case 'price-desc':
      indexed.sort(byPrice(-1));
      break;
    case 'name-asc':
      indexed.sort(byName(1));
      break;
    case 'name-desc':
      indexed.sort(byName(-1));
      break;
    default:
      indexed.sort((a, b) => Number(b.p.featured) - Number(a.p.featured) || a.i - b.i);
  }
  return indexed.map((x) => x.p);
}

export function applyCatalog(list: Product[], f: CatalogFilters): Product[] {
  return sortProducts(filterProducts(list, f), f.sort);
}

/* ---------- URL <-> filters ---------- */
const SORTS = new Set(SORT_OPTIONS.map((s) => s.value));
const AVAILS = new Set(AVAILABILITY_OPTIONS.map((a) => a.value));

function intOrNull(v: string | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export function filtersFromParams(sp: URLSearchParams, validCategories: string[]): CatalogFilters {
  const list = (k: string) => (sp.get(k) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const sort = sp.get('sort') as SortKey | null;
  return {
    q: sp.get('q') ?? '',
    categories: list('category').filter((c) => validCategories.includes(c)) as CategorySlug[],
    brands: list('brand'),
    availability: list('availability').filter((a) => AVAILS.has(a as Availability)) as Availability[],
    minFils: intOrNull(sp.get('min')),
    maxFils: intOrNull(sp.get('max')),
    sort: sort && SORTS.has(sort) ? sort : 'featured',
  };
}

export function paramsFromFilters(f: CatalogFilters, page = 1): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set('q', f.q.trim());
  if (f.categories.length) sp.set('category', f.categories.join(','));
  if (f.brands.length) sp.set('brand', f.brands.join(','));
  if (f.availability.length) sp.set('availability', f.availability.join(','));
  if (f.minFils != null) sp.set('min', String(f.minFils));
  if (f.maxFils != null) sp.set('max', String(f.maxFils));
  if (f.sort !== 'featured') sp.set('sort', f.sort);
  if (page > 1) sp.set('page', String(page));
  return sp;
}

export function countActiveFilters(f: CatalogFilters): number {
  return (
    (f.q.trim() ? 1 : 0) +
    f.categories.length +
    f.brands.length +
    f.availability.length +
    (f.minFils != null || f.maxFils != null ? 1 : 0)
  );
}
