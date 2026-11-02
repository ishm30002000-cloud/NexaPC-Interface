import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CartTotals } from '@/lib/cart-totals';
import { formatMoney } from '@/lib/money';
import { Notice } from './feedback';
import { cn } from '@/lib/utils';

/** Shared order summary: never shows unknown prices as zero. */
export function OrderSummary({ totals, children, collapsible }: { totals: Pick<CartTotals, 'itemCount' | 'knownSubtotalFils' | 'hasPendingPrices' | 'subtotalFils' | 'shippingFils' | 'discountFils' | 'totalFils'>; children?: ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(false);
  const totalText = totals.totalFils == null ? 'Pricing pending' : formatMoney(totals.totalFils);
  const body = (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-3 text-[0.95rem]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Items</dt>
          <dd className="tabular">{totals.itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular text-right" data-testid="text-subtotal">{totals.subtotalFils == null ? 'Pricing pending' : formatMoney(totals.subtotalFils)}</dd>
        </div>
        {totals.hasPendingPrices && totals.knownSubtotalFils > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Priced items so far</dt>
            <dd className="tabular">{formatMoney(totals.knownSubtotalFils)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-right">{totals.shippingFils == null ? 'Calculated at checkout' : formatMoney(totals.shippingFils)}</dd>
        </div>
        {totals.discountFils != null && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Discount</dt>
            <dd className="tabular">-{formatMoney(totals.discountFils)}</dd>
          </div>
        )}
        <div className="glow-line my-1" />
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-display text-lg font-semibold">Total</dt>
          <dd className={cn('tabular font-display text-2xl font-bold', totals.totalFils == null ? 'text-muted' : 'text-cyan')} data-testid="text-total">
            {totalText}
          </dd>
        </div>
      </dl>
      {totals.hasPendingPrices && (
        <Notice tone="warn" title="Catalog preview">
          Some items have no price yet, so a total cannot be shown. Prices will be confirmed before any purchase.
        </Notice>
      )}
      {children}
    </div>
  );
  return (
    <section aria-labelledby="summary-title" className="panel p-5">
      {collapsible ? (
        <>
          <h2 id="summary-title" className="text-xl">
            <button type="button" className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-testid="button-toggle-summary">
              <span>Order summary</span>
              <span className="flex items-center gap-2 font-body text-base font-semibold text-muted">
                {totalText}
                <ChevronDown aria-hidden className={cn('h-5 w-5 transition-transform duration-200', open && 'rotate-180')} />
              </span>
            </button>
          </h2>
          <div className={cn('mt-4', open ? 'block' : 'hidden')}>{body}</div>
        </>
      ) : (
        <>
          <h2 id="summary-title" className="mb-4 text-xl">Order summary</h2>
          <div aria-live="polite">{body}</div>
        </>
      )}
    </section>
  );
}
