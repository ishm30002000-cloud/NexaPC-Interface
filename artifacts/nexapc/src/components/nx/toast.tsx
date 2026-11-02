import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: Tone;
  title: string;
  body?: string;
  link?: { to: string; label: string };
  action?: { label: string; onClick: () => void };
}

const Ctx = createContext<{ show: (t: Omit<ToastItem, 'id'>) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t: translate } = useLocale();
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(1);
  const dismiss = useCallback((id: number) => setItems((p) => p.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = seq.current++;
      setItems((p) => [...p.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), t.action ? 8000 : 5500);
    },
    [dismiss],
  );
  const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        style={{ zIndex: 'var(--z-toast)' }}
      >
        {items.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              key={toast.id}
              className={cn(
                'rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-card)] border bg-surface-2 p-4 shadow-[var(--shadow-glow)]',
                toast.tone === 'error' ? 'border-danger' : toast.tone === 'success' ? 'border-success/60' : 'border-cyan/50',
              )}
              data-testid={`toast-${toast.tone}`}
            >
              <Icon aria-hidden className={cn('mt-0.5 h-5 w-5 shrink-0', toast.tone === 'error' ? 'text-danger' : toast.tone === 'success' ? 'text-success' : 'text-cyan')} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{translate(toast.title)}</p>
                {toast.body && <p className="text-sm text-muted">{translate(toast.body)}</p>}
                <div className="mt-1 flex flex-wrap gap-4">
                  {toast.link && (
                    <Link to={toast.link.to} className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline-offset-4 hover:underline" onClick={() => dismiss(toast.id)}>
                      {translate(toast.link.label)}
                    </Link>
                  )}
                  {toast.action && (
                    <button
                      type="button"
                      className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline-offset-4 hover:underline"
                      onClick={() => { toast.action!.onClick(); dismiss(toast.id); }}
                      data-testid="button-toast-action"
                    >
                      {translate(toast.action.label)}
                    </button>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label={translate('Dismiss notification')} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted hover:text-text">
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useNxToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useNxToast outside ToastProvider');
  return c.show;
}
