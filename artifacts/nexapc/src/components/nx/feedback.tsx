import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Info, RotateCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Availability } from '@/lib/catalog';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />;
}

export function EmptyState({ title, body, icon, action, headingLevel = 2 }: { title: string; body?: string; icon?: ReactNode; action?: ReactNode; headingLevel?: 1 | 2 | 3 }) {
  const H = `h${headingLevel}` as 'h2';
  return (
    <div className="panel grid-bg relative flex flex-col items-center gap-4 overflow-hidden px-6 py-14 text-center" data-testid="empty-state">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan/40 bg-ink text-cyan">{icon}</div>
      <H className="text-2xl">{title}</H>
      {body && <p className="max-w-md text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function ErrorPanel({ title = 'Something went wrong', body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="panel flex flex-col items-start gap-3 border-danger/60 p-6" data-testid="error-panel">
      <h2 className="flex items-center gap-2 text-xl text-danger">
        <AlertTriangle aria-hidden className="h-5 w-5" /> {title}
      </h2>
      {body && <p className="text-muted">{body}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RotateCw aria-hidden className="h-4 w-4" />} data-testid="button-retry">
          Retry
        </Button>
      )}
    </div>
  );
}

const AVAIL = {
  'in-stock': { label: 'In stock', icon: CheckCircle2, cls: 'border-success/50 text-success' },
  'out-of-stock': { label: 'Out of stock', icon: XCircle, cls: 'border-danger/50 text-danger' },
  pending: { label: 'Availability pending', icon: Clock, cls: 'border-line-strong text-muted' },
} as const;

export function AvailabilityBadge({ value, className }: { value: Availability; className?: string }) {
  const a = AVAIL[value];
  const Icon = a.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border bg-ink/70 px-2.5 py-1 text-xs font-semibold', a.cls, className)} data-testid="badge-availability">
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {a.label}
    </span>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'cyan' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider',
        tone === 'cyan' && 'border-cyan/50 text-cyan',
        tone === 'warn' && 'border-warn/60 text-warn',
        tone === 'neutral' && 'border-line-strong text-muted',
      )}
    >
      {children}
    </span>
  );
}

export function Notice({ children, tone = 'info', title, className }: { children: ReactNode; tone?: 'info' | 'warn' | 'success' | 'error'; title?: string; className?: string }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? XCircle : tone === 'warn' ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-card)] border p-4',
        tone === 'info' && 'border-cyan/40 bg-cyan/5',
        tone === 'warn' && 'border-warn/50 bg-warn/5',
        tone === 'success' && 'border-success/50 bg-success/5',
        tone === 'error' && 'border-danger/60 bg-danger/10',
        className,
      )}
    >
      <Icon aria-hidden className={cn('mt-0.5 h-5 w-5 shrink-0', tone === 'info' && 'text-cyan', tone === 'warn' && 'text-warn', tone === 'success' && 'text-success', tone === 'error' && 'text-danger')} />
      <div className="min-w-0 text-[0.95rem]">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-muted">{children}</div>
      </div>
    </div>
  );
}
