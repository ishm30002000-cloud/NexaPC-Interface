import { useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { Product } from '@/data/products';
import { ProductImage } from '@/components/nx/ProductImage';
import { Dialog } from '@/components/nx/overlay';
import { assetUrl } from '@/lib/meta';
import { cn } from '@/lib/utils';

export function Gallery({ product }: { product: Product }) {
  const imgs = product.images;
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [magnified, setMagnified] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = imgs.length;
  const go = (d: number) => n > 1 && setI((x) => (x + d + n) % n);

  if (n === 0) {
    return (
      <div className="panel p-3">
        <ProductImage product={product} eager />
        <p className="mt-3 px-2 text-sm text-muted">A real manufacturer photo for this model has not been supplied yet.</p>
      </div>
    );
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  return (
    <div className="flex flex-col gap-3" onKeyDown={onKey}>
      <div
        className="panel relative p-3"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <button type="button" onClick={() => setZoom(true)} className="group relative block w-full cursor-zoom-in rounded-xl" aria-label={`Zoom image ${i + 1} of ${n}`} data-testid="button-zoom">
          <ProductImage product={product} index={i} eager sizes="(min-width:1024px) 50vw, 100vw" />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-ink/80 px-3 py-1.5 text-sm">
            <ZoomIn aria-hidden className="h-4 w-4" /> Zoom
          </span>
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-ink/80 hover:border-cyan"><ChevronLeft aria-hidden className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-ink/80 hover:border-cyan"><ChevronRight aria-hidden className="h-5 w-5" /></button>
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite">Image {i + 1} of {n}</p>
      {n > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {imgs.map((img, k) => (
            <li key={img.src}>
              <button type="button" onClick={() => setI(k)} aria-label={`View image ${k + 1} of ${n}`} aria-current={k === i ? 'true' : undefined} className={cn('h-20 w-24 overflow-hidden rounded-lg border-2 bg-surface p-1', k === i ? 'border-cyan' : 'border-line hover:border-line-strong')}>
                <img src={assetUrl(img.src)} alt="" width={img.width} height={img.height} loading="lazy" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={zoom} onOpenChange={(o) => { setZoom(o); setMagnified(false); }} title={product.name} description={`Image ${i + 1} of ${n}. Select the image or press Enter to magnify; move the pointer to pan.`}>
        <button
          type="button"
          className={cn('relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink', magnified ? 'cursor-zoom-out' : 'cursor-zoom-in')}
          onClick={() => setMagnified((m) => !m)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          aria-pressed={magnified}
          aria-label={magnified ? 'Reduce magnification' : 'Magnify image'}
        >
          <img src={assetUrl(imgs[i].src)} alt={imgs[i].alt} width={imgs[i].width} height={imgs[i].height} className="h-full w-full object-contain transition-transform duration-200" style={{ transform: magnified ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }} />
        </button>
      </Dialog>
    </div>
  );
}
