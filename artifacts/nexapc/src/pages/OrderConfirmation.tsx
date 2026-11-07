import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Copy, Printer } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useAuth } from '@/store/auth';
import { getOrder } from '@/services/customer';
import { formatMoney } from '@/lib/money';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button, ButtonLink } from '@/components/nx/Button';
import { Notice, ErrorPanel } from '@/components/nx/feedback';

export default function OrderConfirmation() {
  usePageMeta('Order request', 'View your NexaPC order request.');
  const { reference = '' } = useParams();
  const { user, loading } = useAuth();
  const query = useQuery({ queryKey: ['customer', user?.id, 'order', reference], queryFn: () => getOrder(reference), enabled: !!user, refetchInterval: 30_000 });
  const [copied, setCopied] = useState<string | null>(null);
  if (loading) return <div className="container-nexa py-12" role="status">Checking your session…</div>;
  if (!user) return <div className="container-nexa py-12"><Notice tone="info">Sign in to view your order request.</Notice><ButtonLink className="mt-4" to={`/login?next=${encodeURIComponent(`/order-confirmation/${reference}`)}`}>Sign in</ButtonLink></div>;
  if (query.isPending) return <div className="container-nexa py-12" role="status">Loading your request…</div>;
  if (query.isError) return <div className="container-nexa py-12"><ErrorPanel body="Your request could not be loaded." onRetry={() => { void query.refetch(); }} /></div>;
  const order = query.data;
  if (!order) return <div className="container-nexa py-12"><h1>Order request not found</h1><p className="mt-4 text-muted">This reference is not available to your account.</p><ButtonLink className="mt-6" to="/account/orders">My orders</ButtonLink></div>;
  const d = order.delivery;
  return <div className="container-nexa py-8">
    <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Orders', to: '/account/orders' }, { label: order.reference }]} />
    <section className="panel mt-6 flex items-start gap-4 border-success/60 p-6">
      <CheckCircle2 className="h-9 w-9 shrink-0 text-success" aria-hidden />
      <div><h1 className="text-3xl">Order request received</h1><p className="mt-2 capitalize">{order.status.replaceAll('_', ' ')}</p><p className="mt-2 text-muted">Saved on {new Date(order.created_at).toLocaleString('en-KW')}</p></div>
    </section>
    <div className="mt-6"><Notice tone="info">This is an order request, not a paid purchase. No payment was taken or stock reserved. Final prices, availability and delivery charges require confirmation.</Notice></div>
    <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
      <div><p className="text-sm text-muted">Request reference</p><p className="font-display text-2xl font-bold tracking-wider" data-testid="text-reference">{order.reference}</p></div>
      <div className="no-print">
        <Button variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={async () => {
          try { await navigator.clipboard.writeText(order.reference); setCopied('Reference copied'); }
          catch { setCopied('Select the reference and copy it manually.'); }
        }}>Copy</Button>
        <p role="status" className="text-sm text-muted">{copied}</p>
      </div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="panel p-5"><h2>Items</h2>
        <ul className="mt-3 divide-y divide-line">{order.order_items.map(item => <li className="flex flex-wrap justify-between gap-3 py-3" key={item.id}>
          <span className="min-w-0 flex-1">{item.name} <span className="text-muted">x {item.quantity}</span></span>
          <span>{item.unit_price_fils == null ? 'Price pending' : formatMoney(item.unit_price_fils * item.quantity)}</span>
        </li>)}</ul>
        <p className="mt-4 border-t border-line pt-4 font-semibold">Product subtotal: {order.subtotal_fils == null ? 'Pricing pending' : formatMoney(order.subtotal_fils)}</p>
        <p className="text-sm text-muted">Delivery charges and final total are not confirmed.</p>
      </section>
      <section className="panel p-5"><h2>Delivery details</h2>
        <p className="mt-3">{d.fullName}</p><p className="text-muted">{d.email} / {d.phone}</p>
        <p className="text-muted">Block {d.block}, {d.street}, Building {d.building}, {d.city}, {d.governorate}</p>
        {d.notes && <p className="mt-2 text-muted">Notes: {d.notes}</p>}
      </section>
    </div>
    <div className="no-print mt-8 flex flex-wrap gap-3">
      <ButtonLink to="/products">Continue shopping</ButtonLink>
      <ButtonLink to="/account/orders" variant="secondary">My orders</ButtonLink>
      <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print request</Button>
    </div>
  </div>;
}
