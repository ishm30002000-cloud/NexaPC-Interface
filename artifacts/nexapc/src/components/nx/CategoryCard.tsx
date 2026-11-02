import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function CategoryCard({ slug, name, blurb, index, art }: { slug: string; name: string; blurb: string; index: number; art: ReactNode }) {
  return (
    <Link
      to={`/products?category=${slug}`}
      className="panel glow-edge group relative flex min-h-[260px] flex-col justify-between overflow-hidden p-6 transition-transform duration-200 ease-[var(--ease-nexa)] hover:-translate-y-1"
      data-testid={`link-category-${slug}`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-cyan/80 transition-transform duration-250 ease-[var(--ease-nexa)] group-hover:scale-110 group-hover:rotate-6">
        {art}
      </div>
      <span aria-hidden className="font-display text-sm font-semibold tracking-[0.3em] text-muted">0{index}</span>
      <div className="relative">
        <h3 className="text-2xl">{name}</h3>
        <p className="mt-2 max-w-[28ch] text-muted">{blurb}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-display font-semibold uppercase tracking-[0.12em] text-cyan">
          Browse <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  );
}
