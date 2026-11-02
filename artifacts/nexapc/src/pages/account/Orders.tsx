import { Package } from 'lucide-react';
import { EmptyState } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';
import { useLocale } from '@/lib/i18n';

/** Orders require a backend. The table layout below is ready for real data. */
export default function Orders() {
  const { t } = useLocale();
  const orders: { reference: string; date: string; status: string; total: string }[] = [];
  return (
    <section aria-labelledby="or-title" className="flex flex-col gap-6">
      <h2 id="or-title">{t('Orders')}</h2>
      {orders.length === 0 ? (
        <EmptyState icon={<Package aria-hidden className="h-8 w-8" />} title={t('You have no orders yet')} body={t('When online ordering is connected, your orders will appear here.')} action={<ButtonLink to="/products">{t('Shop Now')}</ButtonLink>} />
      ) : (
        <>
          <table className="hidden w-full md:table">
            <caption className="sr-only">{t('Your orders')}</caption>
            <thead><tr>{['Reference', 'Date', 'Status', 'Total'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-left text-muted">{t(h)}</th>)}</tr></thead>
            <tbody>{orders.map((o) => <tr key={o.reference}><td className="px-4 py-3">{o.reference}</td><td className="px-4 py-3">{o.date}</td><td className="px-4 py-3">{o.status}</td><td className="px-4 py-3">{o.total}</td></tr>)}</tbody>
          </table>
          <ul className="flex flex-col gap-3 md:hidden">{orders.map((o) => <li key={o.reference} className="panel p-4">{o.reference} / {o.status} / {o.total}</li>)}</ul>
        </>
      )}
    </section>
  );
}
