import * as RD from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Accessible modal dialog (focus trap, Escape, focus return via Radix). */
export function Dialog({ open, onOpenChange, title, description, children, footer }: BaseProps) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="fixed inset-0 bg-ink/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" style={{ zIndex: 'var(--z-overlay)' }} />
        <RD.Content
          className="panel fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          style={{ zIndex: 'var(--z-overlay)' }}
          aria-describedby={description ? undefined : undefined}
        >
          <div className="glow-line" />
          <div className="flex items-start justify-between gap-4 p-6 pb-2">
            <div>
              <RD.Title className="font-display text-2xl font-semibold">{title}</RD.Title>
              {description ? <RD.Description className="mt-1 text-muted">{description}</RD.Description> : <RD.Description className="sr-only">{title}</RD.Description>}
            </div>
            <RD.Close aria-label="Close dialog" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text">
              <X aria-hidden className="h-5 w-5" />
            </RD.Close>
          </div>
          <div className="overflow-y-auto px-6 pb-6">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line p-4">{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

/** Slide-in panel (filters, mobile nav). */
export function Drawer({ open, onOpenChange, title, description, children, footer, side = 'right', id }: BaseProps & { side?: 'left' | 'right'; id?: string }) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="fixed inset-0 bg-ink/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" style={{ zIndex: 'var(--z-overlay)' }} />
        <RD.Content
          id={id}
          className={cn(
            'fixed inset-y-0 flex h-[100dvh] w-[min(420px,100vw)] flex-col border-line bg-surface shadow-[var(--shadow-glow)] data-[state=open]:animate-in data-[state=open]:duration-200',
            side === 'right' ? 'right-0 border-l data-[state=open]:slide-in-from-right' : 'left-0 border-r data-[state=open]:slide-in-from-left',
          )}
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <div>
              <RD.Title className="font-display text-xl font-semibold">{title}</RD.Title>
              {description ? <RD.Description className="text-sm text-muted">{description}</RD.Description> : <RD.Description className="sr-only">{title}</RD.Description>}
            </div>
            <RD.Close aria-label={`Close ${title.toLowerCase()}`} className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text">
              <X aria-hidden className="h-5 w-5" />
            </RD.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer && <div className="border-t border-line p-4">{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}
