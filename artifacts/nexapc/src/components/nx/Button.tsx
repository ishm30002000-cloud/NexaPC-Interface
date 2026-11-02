import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'icon';

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', full = false) {
  return cn(
    'relative inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-control)] font-display font-semibold uppercase tracking-[0.08em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-nexa)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    size === 'md' && 'min-h-[44px] px-5 text-[0.95rem]',
    size === 'lg' && 'min-h-[52px] px-7 text-base',
    size === 'icon' && 'h-11 w-11 shrink-0',
    variant === 'primary' && 'bg-cyan text-ink hover:bg-cyan-soft hover:shadow-[var(--shadow-glow)]',
    variant === 'secondary' && 'border border-line-strong bg-surface-2 text-text hover:border-cyan hover:text-cyan',
    variant === 'ghost' && 'text-text hover:bg-surface-2 hover:text-cyan',
    variant === 'danger' && 'border border-danger/70 bg-transparent text-danger hover:bg-danger hover:text-ink',
    full && 'w-full',
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, full, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses(variant, size, full), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {loading && <span className="sr-only">Working</span>}
    </button>
  );
});

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

export function ButtonLink({ variant = 'primary', size = 'md', full, className, ...rest }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, size, full), className)} {...rest} />;
}
