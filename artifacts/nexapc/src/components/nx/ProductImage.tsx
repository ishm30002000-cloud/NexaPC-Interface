import { ImageOff } from 'lucide-react';
import type { Product } from '@/data/products';
import { assetUrl } from '@/lib/meta';
import { cn } from '@/lib/utils';

/**
 * Fixed 4:3 frame, object-fit: contain. When no real photo exists we show an
 * explicit "Photo pending" frame — never a generated or substitute image.
 */
export function ProductImage({ product, index = 0, eager, className, sizes = '(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw' }: { product: Product; index?: number; eager?: boolean; className?: string; sizes?: string }) {
  const img = product.images[index];
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-[calc(var(--radius-card)-4px)] bg-[radial-gradient(ellipse_at_50%_40%,#1d1d48,#0c0c22_70%)]', className)}>
      {img ? (
        <img
          src={assetUrl(img.src)}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          className="absolute inset-0 h-full w-full object-contain p-4"
        />
      ) : (
        <div className="grid-bg absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center" role="img" aria-label={`Photo pending for ${product.name}`}>
          <ImageOff aria-hidden className="h-8 w-8 text-muted" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">Photo pending</span>
          <span className="font-display text-lg font-semibold text-text/80">{product.brand}</span>
        </div>
      )}
    </div>
  );
}
