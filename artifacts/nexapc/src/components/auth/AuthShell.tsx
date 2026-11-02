import type { ReactNode } from 'react';
import { Breadcrumb, type Crumb } from '@/components/layout/Breadcrumb';
import { LogoMark } from '@/components/layout/Logo';
import { useLocale } from '@/lib/i18n';

/** Shared two-panel shell for Login, Sign Up and Forgot Password. */
export function AuthShell({ crumbs, title, intro, children, aside }: { crumbs: Crumb[]; title: string; intro: string; children: ReactNode; aside?: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="container-nexa py-8">
      <Breadcrumb items={crumbs} />
      <div className="mt-6 grid overflow-hidden rounded-[var(--radius-card)] border border-line lg:grid-cols-[0.9fr_1.1fr]">
        <div aria-hidden={!aside} className="relative hidden overflow-hidden bg-surface-2 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="grid-bg absolute inset-0" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple/30 blur-3xl" />
          <LogoMark className="relative h-14 w-14" />
          <div className="relative">
            {aside ?? (
              <p className="font-display text-4xl font-bold leading-tight">
                {t('Your setup.')}<br /><span className="text-cyan">{t('Your list.')}</span>
              </p>
            )}
          </div>
        </div>
        <div className="bg-surface p-6 sm:p-10">
          <h1 className="text-[clamp(2rem,1.6rem+1.6vw,2.75rem)]">{title}</h1>
          <p className="mt-2 text-muted">{intro}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
