import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useLocale, productCopy } from '@/lib/i18n';
import { useCart } from '@/store/cart';
import { useNxToast } from '@/components/nx/toast';
import { formatMoney, formatPrice } from '@/lib/money';
import { maxQuantityFor } from '@/lib/cart-totals';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductImage } from '@/components/nx/ProductImage';
import { QuantityStepper } from '@/components/nx/QuantityStepper';
import { OrderSummary } from '@/components/nx/OrderSummary';
import { EmptyState, Notice } from '@/components/nx/feedback';
import { useAuth } from '@/store/auth';
import { useCatalog } from '@/store/catalog';
import { ErrorPanel } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';

export default function Cart() {
  const { locale, t } = useLocale();
  usePageMeta('Cart', 'Review your NexaPC shopping cart.');
  const { totals, setQuantity, remove, restore, ready, syncing, syncError } = useCart();
  const { user } = useAuth();
  const { error: catalogError, refresh } = useCatalog();
  const toast = useNxToast();
  const { lines } = totals;
  const crumbs = [{ label: t('Home'), to: '/' }, { label: t('Cart') }];

  if (catalogError) return <div className="container-nexa py-12"><ErrorPanel body="Your cart's products and prices could not be loaded. Your saved cart has not been changed." onRetry={refresh} /></div>;
  if (!ready) return <><PageHeader crumbs={crumbs} title="Your cart" /><div className="container-nexa py-12" role="status">{syncError ? 'Your saved cart could not be loaded. Use Retry sync above.' : 'Loading your cart…'}</div></>;

  if (lines.length === 0) {
    return (
      <>
        <PageHeader crumbs={crumbs} title={t('Your cart')} />
        <div className="container-nexa py-12">
          <EmptyState icon={<ShoppingCart aria-hidden className="h-8 w-8" />} title={t('Your cart is empty')} body={user ? 'Browse the catalog and add hardware. Your cart is saved to your account.' : 'Browse the catalog and add hardware. Sign in to save your cart across devices.'} action={<ButtonLink to="/products" size="lg">{t('Shop Now')}</ButtonLink>} />
        </div>
      </>
    );
  }

  const onRemove = (id: string, name: string) => {
    const r = remove(id);
    if (r) toast({ tone: 'info', title: t('Removed from cart'), body: name, action: { label: t('Undo'), onClick: () => restore(r.line, r.index) } });
  };

  const totalText = totals.totalFils == null ? t('Pricing pending') : formatMoney(totals.totalFils, locale);

  return (
    <>
      <PageHeader crumbs={crumbs} title={t('Your cart')} intro={`${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}. ${user ? (syncing ? 'Saving your cart…' : syncError ? 'Changes not synced yet.' : 'Saved to your account.') : 'Saved on this device. Sign in to save across devices.'}`} />
      <div className="container-nexa grid gap-8 pb-32 pt-10 lg:grid-cols-[1fr_380px] lg:pb-16">
        <section aria-labelledby="items-title">
          <h2 id="items-title" className="sr-only">{t('Cart items')}</h2>
          {totals.hasPendingPrices && (
            <Notice tone="warn" title={t('Catalog preview')} className="mb-6">{t('Some items do not have a price yet. You can keep them in your cart; prices will be confirmed before any purchase.')}</Notice>
          )}
          <ul className="flex flex-col gap-4">
            {lines.map(({ product: raw, quantity, subtotalFils }) => {
              const product = productCopy(raw, locale);
              return (
              <li key={product.id} className="panel grid grid-cols-[96px_1fr] gap-4 p-4 sm:grid-cols-[140px_1fr]" data-testid={`row-cart-${product.slug}`}>
                <Link to={`/products/${product.slug}`} tabIndex={-1} aria-hidden>
                  <ProductImage product={product} sizes="140px" />
                </Link>
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted">{product.brand}</p>
                    <h3 className="clamp-2 text-lg"><Link to={`/products/${product.slug}`} className="hover:text-cyan">{product.name}</Link></h3>
                    <p className="text-sm text-muted">{product.isSamplePrice ? 'Sample unit price:' : t('Unit price:')} <span className="text-text">{product.priceFils == null ? t('Price pending') : formatPrice(product.priceFils, locale)}</span></p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper value={quantity} max={maxQuantityFor(product)} onChange={(n) => setQuantity(product.id, n)} label={`Quantity for ${product.name}`} />
                    <div className="text-right">
                      <p className="text-sm text-muted">{t('Subtotal')}</p>
                      <p className={subtotalFils == null ? 'font-semibold text-muted' : 'tabular font-display text-lg font-bold'} aria-live="polite">{subtotalFils == null ? t('Price pending') : formatMoney(subtotalFils, locale)}</p>
                    </div>
                  </div>
                  {product.stock == null && <p className="text-xs text-muted">{t(`Preview limit ${maxQuantityFor(product)} per item; real stock not provided yet.`)}</p>}
                  <button type="button" onClick={() => onRemove(product.id, product.name)} className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-semibold text-danger hover:underline" aria-label={`Remove ${product.name}`} data-testid={`button-remove-${product.slug}`}>
                    <Trash2 aria-hidden className="h-4 w-4" /> {t('Remove')}
                  </button>
                </div>
              </li>
            );})}
          </ul>
          <ButtonLink to="/products" variant="ghost" className="mt-6"><ArrowLeft aria-hidden className="rtl-mirror h-4 w-4" /> {t('Continue Shopping')}</ButtonLink>
        </section>
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+24px)]">
            <OrderSummary totals={totals}>
              <ButtonLink to="/checkout" size="lg" full data-testid="link-checkout">{t('Proceed to Checkout')} <ArrowRight aria-hidden className="rtl-mirror h-5 w-5" /></ButtonLink>
            </OrderSummary>
          </div>
        </aside>
        <div className="lg:hidden">
          <OrderSummary totals={totals} collapsible />
        </div>
      </div>
      <div className="no-print fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 backdrop-blur lg:hidden" style={{ zIndex: 'var(--z-sticky-bar)' }}>
        <div className="container-nexa flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-xs text-muted">{t('Total')}</p>
            <p className="tabular font-display text-lg font-bold">{totalText}</p>
          </div>
          <ButtonLink to="/checkout">{t('Proceed to Checkout')}</ButtonLink>
        </div>
      </div>
    </>
  );
}
