import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const btn = 'grid h-11 min-w-11 place-items-center rounded-[var(--radius-control)] border px-3 font-display font-semibold transition-colors duration-150 disabled:opacity-40';
  return (
    <nav aria-label="Pagination" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <button type="button" className={cn(btn, 'border-line hover:border-cyan')} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" data-testid="button-page-prev">
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
        </li>
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={cn(btn, p === page ? 'border-cyan bg-cyan text-ink' : 'border-line hover:border-cyan')}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onChange(p)}
              data-testid={`button-page-${p}`}
            >
              {p}
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={cn(btn, 'border-line hover:border-cyan')} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page" data-testid="button-page-next">
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
