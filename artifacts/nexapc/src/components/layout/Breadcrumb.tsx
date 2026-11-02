import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="no-print">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {c.to && !last ? (
                <Link to={c.to} className="inline-flex min-h-[32px] items-center hover:text-cyan">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className="truncate text-text">
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className="h-4 w-4 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
