import { useEffect, useId, useState, type FormEvent } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import type { CategorySlug } from '@/data/products';
import { AVAILABILITY_OPTIONS, type Availability, type CatalogFilters } from '@/lib/catalog';
import { kwdToFils } from '@/lib/money';
import { priceRangeSchema } from '@/lib/schemas';
import { Button } from '@/components/nx/Button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function CheckRow({ id, label, checked, onChange, count }: { id: string; label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <li>
      <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-surface-2">
        <span className="relative grid h-5 w-5 shrink-0 place-items-center">
          <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-line-strong checked:border-cyan checked:bg-cyan" data-testid={`checkbox-${id}`} />
          <Check aria-hidden strokeWidth={3} className="pointer-events-none absolute h-3.5 w-3.5 text-ink opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="flex-1">{label}</span>
        {count != null && <span className="tabular text-sm text-muted">{count}</span>}
      </label>
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-5">
      <legend className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function filsToInput(f: number | null) {
  return f == null ? '' : String(f / 1000);
}

function PriceRange({ min, max, onApply, idp }: { min: number | null; max: number | null; onApply: (min: number | null, max: number | null) => void; idp: string }) {
  const { t } = useLocale();
  const [a, setA] = useState(filsToInput(min));
  const [b, setB] = useState(filsToInput(max));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setA(filsToInput(min)); setB(filsToInput(max)); }, [min, max]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const minF = a.trim() ? kwdToFils(a) : null;
    const maxF = b.trim() ? kwdToFils(b) : null;
    if ((a.trim() && minF == null) || (b.trim() && maxF == null)) {
      setErr(t('Enter amounts in KWD with up to 3 decimals, for example 25.500'));
      return;
    }
    const r = priceRangeSchema.safeParse({ min: minF, max: maxF });
    if (!r.success) { setErr(r.error.issues[0].message); return; }
    setErr(null);
    onApply(minF, maxF);
  };
  const errId = `${idp}-price-err`;
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <p className="text-sm text-muted">{t('Products without a price yet are hidden while a price range is set.')}</p>
      <div className="grid grid-cols-2 gap-3">
        {[{ k: 'min', l: t('Min (KWD)'), v: a, s: setA }, { k: 'max', l: t('Max (KWD)'), v: b, s: setB }].map((f) => (
          <div key={f.k} className="flex flex-col gap-1">
            <label htmlFor={`${idp}-${f.k}`} className="text-sm">{f.l}</label>
            <input
              id={`${idp}-${f.k}`}
              inputMode="decimal"
              value={f.v}
              onChange={(e) => f.s(e.target.value)}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? errId : undefined}
              className="h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-ink/60 px-3 text-base aria-[invalid=true]:border-danger"
              data-testid={`input-price-${f.k}`}
            />
          </div>
        ))}
      </div>
      {err && (
        <p id={errId} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /> {err}
        </p>
      )}
      <Button type="submit" variant="secondary" data-testid="button-apply-price">{t('Apply price')}</Button>
    </form>
  );
}

export function FilterPanel({ value, onChange, categories, brands, counts }: {
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  categories: { slug: CategorySlug; name: string }[];
  brands: string[];
  counts?: { category: Record<string, number>; brand: Record<string, number> };
}) {
  const { t } = useLocale();
  const idp = useId().replace(/:/g, '');
  return (
    <div className={cn('flex flex-col gap-5')}>
      <Group title={t('Category')}>
        <ul>
          {categories.map((c) => (
            <CheckRow key={c.slug} id={`${idp}-cat-${c.slug}`} label={c.name} count={counts?.category[c.slug]} checked={value.categories.includes(c.slug)} onChange={() => onChange({ ...value, categories: toggle(value.categories, c.slug) })} />
          ))}
        </ul>
      </Group>
      <Group title={t('Brand')}>
        <ul>
          {brands.map((b) => (
            <CheckRow key={b} id={`${idp}-brand-${b.replace(/\s/g, '-')}`} label={b} count={counts?.brand[b]} checked={value.brands.includes(b)} onChange={() => onChange({ ...value, brands: toggle(value.brands, b) })} />
          ))}
        </ul>
      </Group>
      <Group title={t('Availability')}>
        <ul>
          {AVAILABILITY_OPTIONS.map((a) => (
            <CheckRow key={a.value} id={`${idp}-av-${a.value}`} label={t(a.label)} checked={value.availability.includes(a.value)} onChange={() => onChange({ ...value, availability: toggle<Availability>(value.availability, a.value) })} />
          ))}
        </ul>
      </Group>
      <Group title={t('Price range')}>
        <PriceRange idp={idp} min={value.minFils} max={value.maxFils} onApply={(minFils, maxFils) => onChange({ ...value, minFils, maxFils })} />
      </Group>
    </div>
  );
}
