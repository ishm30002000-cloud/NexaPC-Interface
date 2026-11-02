import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        {items.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                'rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-card)] border bg-surface-2 p-4 shadow-[var(--shadow-glow)]',
                t.tone === 'error' ? 'border-danger' : t.tone === 'success' ? 'border-success/60' : 'border-cyan/50',
              )}
              data-testid={`toast-${t.tone}`}
            >
              <Icon aria-hidden className={cn('mt-0.5 h-5 w-5 shrink-0', t.tone === 'error' ? 'text-danger' : t.tone === 'success' ? 'text-success' : 'text-cyan')} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.title}</p>
                {t.body && <p className="text-sm text-muted">{t.body}</p>}
                <div className="mt-1 flex flex-wrap gap-4">
                  {t.link && (
                    <Link to={t.link.to} className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline-offset-4 hover:underline" onClick={() => dismiss(t.id)}>
                      {t.link.label}
                    </Link>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline-offset-4 hover:underline"
                      onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                      data-testid="button-toast-action"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted hover:text-text">
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
