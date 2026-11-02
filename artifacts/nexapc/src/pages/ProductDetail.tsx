import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, PackageX, ShoppingCart } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useAsync } from '@/hooks/use-async';
import { getProductBySlug, getRelatedProducts } from '@/services/products';
import { CATEGORIES, type Product } from '@/data/products';
import { availabilityOf } from '@/lib/catalog';
import { formatPrice } from '@/lib/money';
import { maxQuantityFor } from '@/lib/cart-totals';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Gallery } from '@/components/product/Gallery';
import { AvailabilityBadge, Badge, EmptyState, ErrorPanel, Notice } from '@/components/nx/feedback';
import { Button, ButtonLink } from '@/components/nx/Button';
import { QuantityStepper } from '@/components/nx/QuantityStepper';
import { ProductCard, ProductCardSkeleton } from '@/components/nx/ProductCard';

function Related({ product }: { product: Product }) {
  const { status, data, retry } = useAsync(() => getRelatedProducts(product), `rel-${product.id}`);
  return (
    <section aria-labelledby="rel-title" className="section border-t border-line">
      <div className="container-nexa">
        <h2 id="rel-title">Related products</h2>
        {status === 'error' ? (
          <div className="mt-6"><ErrorPanel body="Related products could not be loaded." onRetry={retry} /></div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {status === 'loading' && !data ? [0, 1, 2, 3].map((i) => <li key={i}><ProductCardSkeleton /></li>) : data!.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useAddToCart();
  const avail = availabilityOf(product);
  const max = maxQuantityFor(product);
  const out = avail === 'out-of-stock';
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-muted">Price</p>
        <p className={product.priceFils == null ? 'font-display text-3xl font-semibold text-muted' : 'tabular font-display text-4xl font-bold text-cyan'} data-testid="text-product-price">
          {formatPrice(product.priceFils)}
        </p>
      </div>
      {!out && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium" id="qty-label">Quantity</span>
          <QuantityStepper value={qty} max={max} onChange={setQty} describedBy="qty-note" />
          <p id="qty-note" className="text-sm text-muted">
            {product.stock == null ? `Stock not provided yet. Catalog preview allows up to ${max}; this is not a stock figure.` : `${max} available.`}
          </p>
        </div>
      )}
      <Button size="lg" full disabled={out} onClick={() => add(product, qty)} icon={<ShoppingCart aria-hidden className="h-5 w-5" />} data-testid="button-add-to-cart">
        {out ? 'Out of Stock' : 'Add to Cart'}
      </Button>
      {product.priceFils == null && !out && (
        <Notice tone="info" title="Catalog preview">You can save this item in your cart. Its price will be confirmed before any purchase.</Notice>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { status, data: product, retry } = useAsync(() => getProductBySlug(slug), `pd-${slug}`);
  usePageMeta(product?.name ?? (status === 'success' ? 'Product not found' : 'Product'), product?.shortDescription ?? 'Product details on NexaPC.');
  const add = useAddToCart();

  if (status === 'loading') {
    return (
      <div className="container-nexa grid gap-10 py-10 lg:grid-cols-2" role="status" aria-live="polite">
        <span className="sr-only">Loading product</span>
        <div className="skeleton aspect-[4/3]" />
        <div className="flex flex-col gap-4"><div className="skeleton h-5 w-24" /><div className="skeleton h-12 w-4/5" /><div className="skeleton h-10 w-40" /><div className="skeleton h-40" /></div>
      </div>
    );
  }
  if (status === 'error') return <div className="container-nexa py-16"><ErrorPanel title="Product could not be loaded" onRetry={retry} /></div>;
  if (!product) {
    return (
      <div className="container-nexa py-16">
        <EmptyState headingLevel={1} icon={<PackageX aria-hidden className="h-8 w-8" />} title="Product not found" body="We could not find a product at this address. It may have been renamed or removed." action={<ButtonLink to="/products">Browse products</ButtonLink>} />
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.slug === product.category)!;
  const specs = product.specs.filter((s) => s.value);
  const avail = availabilityOf(product);

  return (
    <>
      <div className="container-nexa pb-28 pt-6 lg:pb-12">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: cat.name, to: `/products?category=${cat.slug}` }, { label: product.name }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Gallery product={product} />
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <div className="panel flex flex-col gap-5 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <AvailabilityBadge value={avail} />
                {product.isPlaceholder && <Badge tone="warn">Placeholder</Badge>}
              </div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-cyan">{product.brand}</p>
              <h1 className="text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{product.name}</h1>
              <p className="text-muted">{product.shortDescription}</p>
              <div className="glow-line" />
              <BuyBox product={product} />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="spec-title">
            <h2 id="spec-title">Specifications</h2>
            {specs.length ? (
              <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line" tabIndex={0} role="region" aria-labelledby="spec-title">
                <table className="w-full min-w-[420px] text-left">
                  <caption className="sr-only">Specifications for {product.name}</caption>
                  <tbody>
                    {specs.map((s, k) => (
                      <tr key={s.label} className={k % 2 ? 'bg-surface' : 'bg-surface-2/60'}>
                        <th scope="row" className="w-2/5 px-5 py-3 font-medium text-muted">{s.label}</th>
                        <td className="px-5 py-3">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-muted">Specifications have not been supplied for this product yet.</p>
            )}
          </section>
          <section aria-labelledby="desc-title">
            <h2 id="desc-title">Description</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>
            {product.reference && (
              <a href={product.reference} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-semibold text-cyan underline-offset-4 hover:underline">
                Source for these details <ExternalLink aria-hidden className="h-4 w-4" /><span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </section>
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 backdrop-blur lg:hidden" style={{ zIndex: 'var(--z-sticky-bar)' }}>
        <div className="container-nexa flex items-center justify-between gap-4 py-3">
          <p className={product.priceFils == null ? 'font-display font-semibold text-muted' : 'tabular font-display text-xl font-bold text-cyan'}>{formatPrice(product.priceFils)}</p>
          <Button disabled={avail === 'out-of-stock'} onClick={() => add(product, 1)} icon={<ShoppingCart aria-hidden className="h-4 w-4" />} data-testid="button-add-to-cart-sticky">
            {avail === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      <Related product={product} />
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}
