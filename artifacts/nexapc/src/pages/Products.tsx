import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useAsync, useDebounced } from '@/hooks/use-async';
import { getCategories, getProducts } from '@/services/products';
import { applyCatalog, countActiveFilters, EMPTY_FILTERS, filtersFromParams, paramsFromFilters, SORT_OPTIONS, AVAILABILITY_OPTIONS, type CatalogFilters, type SortKey } from '@/lib/catalog';
import { formatMoney } from '@/lib/money';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterPanel } from '@/components/catalog/FilterPanel';
import { ProductCard, ProductCardSkeleton } from '@/components/nx/ProductCard';
import { EmptyState, ErrorPanel } from '@/components/nx/feedback';
import { Pagination } from '@/components/nx/Pagination';
import { Drawer } from '@/components/nx/overlay';
import { Button } from '@/components/nx/Button';
import { useLocale, productCopy } from '@/lib/i18n';

const PAGE_SIZE = 8;

export default function Products() {
  const { locale, t } = useLocale();
  const [sp, setSp] = useSearchParams();
  const categories = getCategories().map((c) => ({ ...c, name: t(c.name) }));
  const categoryData = useMemo(() => categories, [locale]);
  const filters = useMemo(() => filtersFromParams(sp, categoryData.map((c) => c.slug)), [sp, categoryData]);
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const { status, data, retry } = useAsync(getProducts, 'catalog');
  const brands = [...new Set((data ?? []).map(p => p.brand))].sort();

  const catName = filters.categories.length === 1 ? categoryData.find((c) => c.slug === filters.categories[0])?.name : null;
  usePageMeta(catName ?? 'Products', 'Browse PC components, gaming monitors, SSDs, cooling and graphics cards. Filter by category, brand, price and availability.');

  const commit = (next: CatalogFilters, opts?: { replace?: boolean; page?: number }) => setSp(paramsFromFilters(next, opts?.page ?? 1), { replace: opts?.replace });

  // Debounced search: local input mirrors URL, URL updates after 300ms (replace, so typing does not flood history).
  const [q, setQ] = useState(filters.q);
  const dq = useDebounced(q, 300);
  const lastUrlQ = useRef(filters.q);
  useEffect(() => {
    if (filters.q !== lastUrlQ.current) { lastUrlQ.current = filters.q; setQ(filters.q); }
  }, [filters.q]);
  useEffect(() => {
    if (dq !== filters.q) { lastUrlQ.current = dq; commit({ ...filters, q: dq }, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const all = data ?? [];
  const results = useMemo(() => applyCatalog(all, filters), [all, filters]);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const counts = useMemo(() => {
    const category: Record<string, number> = {};
    const brand: Record<string, number> = {};
    for (const p of all) { category[p.category] = (category[p.category] ?? 0) + 1; brand[p.brand] = (brand[p.brand] ?? 0) + 1; }
    return { category, brand };
  }, [all]);

  // Mobile drawer: draft filters with live count, committed on Apply.
  const [drawer, setDrawer] = useState(false);
  const [draft, setDraft] = useState<CatalogFilters>(filters);
  useEffect(() => { if (drawer) setDraft(filters); }, [drawer]); // eslint-disable-line react-hooks/exhaustive-deps
  const draftCount = useMemo(() => applyCatalog(all, draft).length, [all, draft]);

  const chips: { key: string; label: string; remove: () => CatalogFilters }[] = [
    ...(filters.q ? [{ key: 'q', label: `${t('Search:')} "${filters.q}"`, remove: () => ({ ...filters, q: '' }) }] : []),
    ...filters.categories.map((c) => ({ key: `c-${c}`, label: categories.find((x) => x.slug === c)?.name ?? c, remove: () => ({ ...filters, categories: filters.categories.filter((x) => x !== c) }) })),
    ...filters.brands.map((b) => ({ key: `b-${b}`, label: b, remove: () => ({ ...filters, brands: filters.brands.filter((x) => x !== b) }) })),
    ...filters.availability.map((a) => ({ key: `a-${a}`, label: t(AVAILABILITY_OPTIONS.find((x) => x.value === a)!.label), remove: () => ({ ...filters, availability: filters.availability.filter((x) => x !== a) }) })),
    ...(filters.minFils != null || filters.maxFils != null
      ? [{ key: 'price', label: `${t('Price:')} ${filters.minFils != null ? formatMoney(filters.minFils, locale) : t('any')} – ${filters.maxFils != null ? formatMoney(filters.maxFils, locale) : t('any')}`, remove: () => ({ ...filters, minFils: null, maxFils: null }) }]
      : []),
  ];
  const active = countActiveFilters(filters);
  const gridTop = useRef<HTMLDivElement>(null);

  return (
    <>
      <PageHeader crumbs={[{ label: t('Home'), to: '/' }, { label: t('Products') }]} eyebrow={t('Catalog')} title={catName ?? t('All products')} intro={t('Search by name, then narrow by category, brand, price and availability.')} />
      <div className="container-nexa py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside aria-labelledby="filters-title" className="hidden lg:block">
            <div className="panel sticky top-[calc(var(--header-h)+24px)] max-h-[calc(100dvh-var(--header-h)-48px)] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="filters-title" className="text-xl">{t('Filters')}</h2>
                {active > 0 && <button type="button" onClick={() => commit({ ...EMPTY_FILTERS, sort: filters.sort })} className="min-h-[44px] text-sm font-semibold text-cyan underline-offset-4 hover:underline">{t('Clear all')}</button>}
              </div>
              <FilterPanel value={filters} onChange={(n) => commit(n)} categories={categoryData} brands={brands} counts={counts} />
            </div>
          </aside>

          <div ref={gridTop} className="min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative flex-1">
                <label htmlFor="catalog-search" className="mb-1 block text-sm font-medium">{t('Search by name')}</label>
                <Search aria-hidden className="catalog-search-icon pointer-events-none absolute bottom-3.5 left-4 h-5 w-5 text-muted" />
                <input id="catalog-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('For example: 990 PRO')} className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-ink/60 pl-12 pr-4 text-base placeholder:text-muted/70 focus-visible:border-cyan" data-testid="input-catalog-search" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 md:w-56">
                  <label htmlFor="sort" className="mb-1 block text-sm font-medium">{t('Sort by')}</label>
                  <select id="sort" value={filters.sort} onChange={(e) => commit({ ...filters, sort: e.target.value as SortKey })} className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-ink/60 px-3 text-base" data-testid="select-sort">
                    {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value} className="bg-surface">{t(s.label)}</option>)}
                  </select>
                </div>
                <Button variant="secondary" className="mt-auto h-12 lg:hidden" onClick={() => setDrawer(true)} icon={<SlidersHorizontal aria-hidden className="h-4 w-4" />} aria-expanded={drawer} data-testid="button-open-filters">
                  {t('Filters')}{active ? ` (${active})` : ''}
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <p role="status" aria-live="polite" className="mr-2 font-semibold" data-testid="text-result-count">
                {status === 'loading' && !data ? t('Loading products') : `${results.length} ${results.length === 1 ? t('product') : t('products')}`}
              </p>
              {chips.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={t('Active filters')}>
                  {chips.map((c) => (
                    <li key={c.key}>
                      <button type="button" onClick={() => commit(c.remove())} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-cyan/60 bg-cyan/10 py-1 pl-3 pr-2 text-sm hover:bg-cyan/20" aria-label={`Remove filter ${c.label}`} data-testid={`chip-${c.key}`}>
                        {c.label} <X aria-hidden className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" onClick={() => commit({ ...EMPTY_FILTERS, sort: filters.sort })} className="min-h-[36px] px-2 text-sm font-semibold text-cyan underline underline-offset-4" data-testid="button-clear-filters">{t('Clear all filters')}</button>
                  </li>
                </ul>
              )}
            </div>

            <div className="mt-6">
              {status === 'error' ? (
                <ErrorPanel title={t('Products could not be loaded')} body={t('Check your connection and try again.')} onRetry={retry} />
              ) : status === 'loading' && !data ? (
                <ul className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => <li key={i}><ProductCardSkeleton /></li>)}
                </ul>
              ) : results.length === 0 ? (
                <EmptyState icon={<PackageSearch aria-hidden className="h-8 w-8" />} title={t('No products match')} body={t('Try a different search or remove a filter.')} action={<Button onClick={() => { setQ(''); commit(EMPTY_FILTERS); }}>{t('Clear all filters')}</Button>} />
              ) : (
                <>
                  <ul className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
                    {visible.map((p) => <li key={p.id}><ProductCard product={productCopy(p, locale)} headingLevel={2} /></li>)}
                  </ul>
                  <Pagination page={current} pageCount={pageCount} onChange={(p) => { commit(filters, { page: p }); gridTop.current?.scrollIntoView(); }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={drawer}
        onOpenChange={setDrawer}
        title={t('Filters')}
        description={t('Changes apply when you press Apply.')}
        footer={
          <div className="flex flex-col gap-3">
              <p role="status" aria-live="polite" className="text-center text-muted">{draftCount} {`${draftCount === 1 ? t('product') : t('products')} ${t('match')}`}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setDraft({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}>{t('Reset')}</Button>
              <Button onClick={() => { commit(draft); setDrawer(false); }} data-testid="button-apply-filters">{t('Apply')} ({draftCount})</Button>
            </div>
          </div>
        }
      >
        <FilterPanel value={draft} onChange={setDraft} categories={categoryData} brands={brands} counts={counts} />
      </Drawer>
    </>
  );
}
