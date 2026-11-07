import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { getOrders } from '@/services/customer';
import { formatMoney } from '@/lib/money';
import { EmptyState, ErrorPanel, Notice } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';

export default function Orders() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['customer', user?.id, 'orders'], queryFn: getOrders, refetchInterval: 30_000 });
  return <section aria-labelledby="orders-title" className="flex flex-col gap-6">
    <h2 id="orders-title">My orders</h2>
    <Notice tone="info">These are order requests for store review. No online payment has been collected and stock is not reserved.</Notice>
    {isPending ? <p role="status">Loading your orders…</p> : isError ? <ErrorPanel body="Your orders could not be loaded." onRetry={() => { void refetch(); }} /> : !data?.length ? (
      <EmptyState icon={<Package className="h-8 w-8" />} title="No order requests yet" body="Submitted requests will appear here." action={<ButtonLink to="/products">Browse products</ButtonLink>} />
    ) : <ul className="flex flex-col gap-4">{data.map(order => <li key={order.id} className="panel flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <Link to={`/order-confirmation/${order.reference}`} className="font-display text-xl font-bold text-cyan underline-offset-4 hover:underline">{order.reference}</Link>
        <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString('en-KW')} · {order.order_items.length} product lines</p>
        <p className="capitalize">{order.status.replaceAll('_', ' ')}</p>
      </div>
      <div className="text-right"><p className="text-sm text-muted">Product subtotal</p><p>{order.subtotal_fils == null ? 'Pricing pending' : formatMoney(order.subtotal_fils)}</p><Link to={`/order-confirmation/${order.reference}`} className="inline-flex min-h-11 items-center text-cyan">View request</Link></div>
    </li>)}</ul>}
  </section>;
}
