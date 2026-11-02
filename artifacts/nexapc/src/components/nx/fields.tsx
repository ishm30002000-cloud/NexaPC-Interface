import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';

const inputBase =
  'block w-full min-h-[48px] rounded-[var(--radius-control)] border bg-ink/60 px-4 text-base text-text placeholder:text-muted/70 transition-colors duration-150 hover:border-line-strong focus-visible:border-cyan focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cyan aria-[invalid=true]:border-danger';

function FieldShell({ id, label, required, hint, error, children }: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[0.95rem] font-medium text-text">
        {label}
        {required ? <span className="ml-1 text-muted">{t('(required)')}</span> : <span className="ml-1 text-muted">{t('(optional)')}</span>}
      </label>
        {hint && <p id={`${id}-hint`} className="text-sm text-muted">{t(hint)}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string, extra?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`, extra].filter(Boolean).join(' ') || undefined;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, hint, error, id, required, className, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} hint={hint} error={error}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(fid, hint, error)}
        className={cn(inputBase, className)}
        {...rest}
      />
    </FieldShell>
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, hint, error, id, required, className, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} hint={hint} error={error}>
      <textarea ref={ref} id={fid} rows={3} aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, hint, error)} className={cn(inputBase, 'py-3', className)} {...rest} />
    </FieldShell>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps & { describedExtra?: string }>(function PasswordField(
  { label, hint, error, id, required, describedExtra, ...rest },
  ref,
) {
  const { t } = useLocale();
  const auto = useId();
  const fid = id ?? auto;
  const [shown, setShown] = useState(false);
  return (
    <FieldShell id={fid} label={label} required={required} hint={hint} error={error}>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          type={shown ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(fid, hint, error, describedExtra)}
          className={cn(inputBase, 'pr-14')}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-label={shown ? `${t('Hide')} ${label.toLowerCase()}` : `${t('Show')} ${label.toLowerCase()}`}
          aria-controls={fid}
          className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-cyan"
          data-testid={`button-toggle-${fid}`}
        >
          {shown ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
        </button>
      </div>
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: readonly { value: string; label: string }[] | readonly string[];
  placeholder?: string;
  hideOptionalTag?: boolean;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, hint, error, id, required, options, placeholder, className, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} hint={hint} error={error}>
      <div className="relative">
        <select
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fid, hint, error)}
          className={cn(inputBase, 'appearance-none pr-12', className)}
          {...rest}
        >
          {placeholder != null && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const v = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={v.value} value={v.value} className="bg-surface">
                {v.label}
              </option>
            );
          })}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
      </div>
    </FieldShell>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, error, id, className, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex min-h-[44px] items-center gap-3">
        <span className="relative grid h-6 w-6 shrink-0 place-items-center">
          <input
            ref={ref}
            id={fid}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fid}-error` : undefined}
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-line-strong bg-ink checked:border-cyan checked:bg-cyan aria-[invalid=true]:border-danger"
            {...rest}
          />
          <Check aria-hidden className="pointer-events-none absolute h-4 w-4 text-ink opacity-0 peer-checked:opacity-100" strokeWidth={3} />
        </span>
        <label htmlFor={fid} className="cursor-pointer text-[0.95rem]">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${fid}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

/** Error summary — receives focus after a failed submit. */
export function ErrorSummary({ errors, focusKey }: { errors: { field: string; message: string }[]; focusKey: number }) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusKey > 0 && errors.length) ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);
  if (!errors.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="rounded-[var(--radius-card)] border-2 border-danger bg-danger/10 p-4" data-testid="error-summary">
      <h2 id="error-summary-title" className="flex items-center gap-2 font-display text-lg font-semibold text-danger">
        <AlertCircle aria-hidden className="h-5 w-5" /> {t(errors.length === 1 ? 'There is 1 problem with this form' : 'There are problems with this form')}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {errors.map((e) => (
          <li key={e.field}>
            <a
              href={`#${e.field}`}
              className="text-text underline underline-offset-4 hover:text-cyan"
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(e.field)?.focus();
              }}
            >
              {t(e.message)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Turn react-hook-form errors into summary entries, in field order. */
export function summarize(errors: Record<string, { message?: unknown } | undefined>, order: string[], prefix = ''): { field: string; message: string }[] {
  return order
    .filter((k) => errors[k]?.message)
    .map((k) => ({ field: `${prefix}${k}`, message: String(errors[k]!.message) }));
}
