import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/products';
import { availabilityOf } from '@/lib/catalog';
import { formatPrice } from '@/lib/money';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { AvailabilityBadge, Badge } from './feedback';
import { Button } from './Button';
import { ProductImage } from './ProductImage';
import { CATEGORIES } from '@/data/products';
import { useLocale } from '@/lib/i18n';

/** The single product card used everywhere. */
export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const addToCart = useAddToCart();
  const { t, locale } = useLocale();
  const avail = availabilityOf(product);
  const H = `h${headingLevel}` as 'h3';
  const cat = CATEGORIES.find((c) => c.slug === product.category)?.name;
  return (
    <article className="panel glow-edge group flex h-full flex-col gap-4 p-3 transition-transform duration-200 ease-[var(--ease-nexa)] hover:-translate-y-1" data-testid={`card-product-${product.slug}`}>
      <div className="relative">
        <ProductImage product={product} />
        <div className="absolute left-2 top-2 flex flex-wrap gap-2">
          <AvailabilityBadge value={avail} />
          {product.isPlaceholder && <Badge tone="warn">{t('Placeholder')}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {product.brand} <span aria-hidden>/</span> <span className="sr-only">,</span> {cat ? t(cat) : ''}
        </p>
        <H className="clamp-2 text-lg leading-snug">
          <Link to={`/products/${product.slug}`} className="hover:text-cyan">
            {product.name}
          </Link>
        </H>
        <p className={product.priceFils == null ? 'font-display text-lg font-semibold text-muted' : 'tabular font-display text-xl font-bold text-cyan'} data-testid={`text-price-${product.slug}`}>
          {product.priceFils == null ? t('Price pending') : formatPrice(product.priceFils, locale)}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 px-2 pb-2 min-[380px]:grid-cols-2">
        <Link
          to={`/products/${product.slug}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] border border-line-strong px-3 font-display text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-150 hover:border-cyan hover:text-cyan"
          aria-label={`${t('View details for')} ${product.name}`}
          data-testid={`link-view-${product.slug}`}
        >
          {t('View Details')}
        </Link>
        <Button
          className="px-3 text-sm"
          onClick={() => addToCart(product, 1)}
          disabled={avail === 'out-of-stock'}
          aria-label={avail === 'out-of-stock' ? `${product.name} — ${t('Out of Stock')}` : `${t('Add')} ${product.name} ${t('to cart')}`}
          icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
          data-testid={`button-add-${product.slug}`}
        >
          {avail === 'out-of-stock' ? t('Out of Stock') : t('Add to Cart')}
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="panel flex flex-col gap-4 p-3" aria-hidden>
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-6 w-4/5" />
      <div className="skeleton h-6 w-1/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-11" />
        <div className="skeleton h-11" />
      </div>
    </div>
  );
}
