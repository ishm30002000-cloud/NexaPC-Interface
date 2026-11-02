import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, Eye, Printer, SearchX, XCircle } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { getPreviewOrder, type OrderStatus } from '@/services/order-preview';
import { computeTotals } from '@/lib/cart-totals';
import { getProductsSync } from '@/services/products';
import { formatPrice, formatMoney } from '@/lib/money';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button, ButtonLink } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';
import { OrderSummary } from '@/components/nx/OrderSummary';
import { cn } from '@/lib/utils';

const BANNER: Record<OrderStatus | 'not-found', { icon: typeof CheckCircle2; title: string; body: string; cls: string }> = {
  confirmed: { icon: CheckCircle2, title: 'Order confirmed', body: 'This is how a confirmed order will look.', cls: 'border-success/60 text-success' },
  pending: { icon: Clock, title: 'Payment pending', body: 'This is how an order awaiting payment will look.', cls: 'border-warn/60 text-warn' },
  failed: { icon: XCircle, title: 'Payment failed', body: 'This is how a failed payment will look.', cls: 'border-danger/60 text-danger' },
  'not-found': { icon: SearchX, title: 'Order not found', body: 'There is no order with this reference. Orders cannot be placed on this site yet.', cls: 'border-line-strong text-muted' },
};

export default function OrderConfirmation() {
  const { reference = '' } = useParams();
  const [sp] = useSearchParams();
  const order = getPreviewOrder(reference, sp.get('preview'));
  const variant = order?.status ?? 'not-found';
  usePageMeta(order ? `Preview: order ${variant}` : 'Order not found', 'Order confirmation layout preview.');
  const [copied, setCopied] = useState<string | null>(null);
  const b = BANNER[variant];
  const totals = order ? computeTotals(order.items, getProductsSync()) : null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(reference); setCopied('Reference copied'); }
    catch { setCopied('Could not copy. Select the reference and copy it manually.'); }
  };

  return (
    <div className="container-nexa py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Order confirmation' }]} />
      <div className="no-print mt-6">
        <Notice tone="warn" title="Preview mode - sample data, not a real order">
          No order has been placed. Switch variants:{' '}
          {(['confirmed', 'pending', 'failed'] as const).map((s) => (
            <Link key={s} to={`?preview=${s}`} className={cn('mr-3 inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4', variant === s ? 'text-text' : 'text-cyan')} aria-current={variant === s ? 'page' : undefined}>{s}</Link>
          ))}
          <Link to="?" className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline underline-offset-4">not found</Link>
        </Notice>
      </div>

      <div className={cn('print-plain panel mt-6 flex items-start gap-4 border-2 p-6', b.cls)} role="status">
        <b.icon aria-hidden className="h-9 w-9 shrink-0" />
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]"><Eye aria-hidden className="h-4 w-4" /> Preview</p>
          <h1 className="text-[clamp(1.75rem,1.4rem+1.6vw,2.75rem)] text-text">{b.title}</h1>
          <p className="text-muted">{b.body}</p>
        </div>
      </div>

      <div className="print-plain panel mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted">Order reference</p>
          <p className="font-display text-2xl font-bold tracking-wider" data-testid="text-reference">{reference}</p>
        </div>
        <div className="no-print flex flex-col items-end">
          <Button variant="secondary" onClick={copy} icon={<Copy aria-hidden className="h-4 w-4" />} data-testid="button-copy-ref">Copy</Button>
          <p role="status" aria-live="polite" className="text-sm text-muted">{copied}</p>
        </div>
      </div>

      {order && totals && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <section aria-labelledby="oc-items" className="print-plain panel p-5">
              <h2 id="oc-items" className="text-xl">Items</h2>
              <ul className="mt-3 divide-y divide-line">
                {totals.lines.map((l) => (
                  <li key={l.product.id} className="flex flex-wrap justify-between gap-3 py-3">
                    <span className="min-w-0 flex-1">{l.product.name} <span className="text-muted">x {l.quantity}</span></span>
                    <span>{l.subtotalFils == null ? formatPrice(null) : formatMoney(l.subtotalFils)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="oc-del" className="print-plain panel p-5">
              <h2 id="oc-del" className="text-xl">Delivery details</h2>
              <p className="mt-2">{order.delivery.fullName}</p>
              <p className="text-muted">{order.delivery.phone}</p>
              <p className="text-muted">{order.delivery.address}</p>
            </section>
          </div>
          <div className="print-plain"><OrderSummary totals={totals} /></div>
        </div>
      )}

      <div className="no-print mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/products">Continue Shopping</ButtonLink>
        <ButtonLink to="/account/orders" variant="secondary">View My Orders</ButtonLink>
        <Button variant="secondary" onClick={() => window.print()} icon={<Printer aria-hidden className="h-4 w-4" />}>Print receipt</Button>
        <ButtonLink to="/" variant="ghost">Home</ButtonLink>
      </div>
    </div>
  );
}
