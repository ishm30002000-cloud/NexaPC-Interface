import type { ReactNode } from 'react';
import { Breadcrumb, type Crumb } from './Breadcrumb';

/** Shared page heading block: breadcrumb, eyebrow, H1, intro. */
export function PageHeader({ crumbs, eyebrow, title, intro, children }: { crumbs: Crumb[]; eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-80 w-[40rem] rounded-full bg-purple/20 blur-3xl" />
      <div className="container-nexa relative flex flex-col gap-4 py-8 md:py-12">
        <Breadcrumb items={crumbs} />
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-[clamp(2rem,1.5rem+2.2vw,3.25rem)]">{title}</h1>
        {intro && <div className="max-w-2xl text-lg text-muted">{intro}</div>}
        {children}
      </div>
    </div>
  );
}
