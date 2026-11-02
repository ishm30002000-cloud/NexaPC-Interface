import { Suspense, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { useCart } from '@/store/cart';
import { Notice } from '@/components/nx/feedback';
import { Header } from './Header';
import { Footer } from './Footer';
import { LogoMark } from './Logo';
import { useLocale } from '@/lib/i18n';

function SkipLink() {
  const { t } = useLocale();
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-cyan focus:px-4 focus:py-3 focus:font-semibold focus:text-ink" style={{ zIndex: 'var(--z-toast)' }} data-testid="link-skip">
      {t('Skip to main content')}
    </a>
  );
}

function RouteFallback() {
  const { t } = useLocale();
  return (
    <div className="container-nexa py-16" role="status" aria-live="polite">
      <span className="sr-only">{t('Loading page')}</span>
      <div className="skeleton h-10 w-2/3 max-w-lg" />
      <div className="mt-4 skeleton h-5 w-1/2 max-w-md" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-64" />)}
      </div>
    </div>
  );
}

function useScrollTopOnRoute() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
  }, [pathname]);
}

function CartRecoveredNotice() {
  const { t, locale } = useLocale();
  const { recovered, dismissRecovered, storageFailed } = useCart();
  if (!recovered && !storageFailed) return null;
  return (
    <div className="container-nexa pt-4">
      <Notice tone="warn" title={t(recovered ? 'Your saved cart could not be read' : 'Cart cannot be saved on this device')}>
        {t(recovered ? 'The stored cart data was damaged, so it has been reset. ' : 'Browser storage is unavailable; your cart will clear when you leave. ')}
        {recovered && (
          <button type="button" onClick={dismissRecovered} className="min-h-[44px] font-semibold text-cyan underline underline-offset-4">
            {t('Dismiss')}
          </button>
        )}
      </Notice>
    </div>
  );
}

export function SiteLayout() {
  useScrollTopOnRoute();
  const { pathname } = useLocation();
  return (
    <div className="noise flex min-h-[100dvh] flex-col">
      <SkipLink />
      <Header />
      <CartRecoveredNotice />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

/** Simplified checkout shell: same logo, tokens and styles. */
export function CheckoutLayout() {
  useScrollTopOnRoute();
  const { t } = useLocale();
  return (
    <div className="noise flex min-h-[100dvh] flex-col">
      <SkipLink />
      <header className="border-b border-line bg-ink/90">
        <div className="container-nexa flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link to="/" className="flex min-h-[44px] items-center gap-2.5" aria-label={t('NexaPC home')}>
            <LogoMark />
            <span className="font-display text-2xl font-bold">NEXA<span className="text-cyan">PC</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/cart" className="inline-flex min-h-[44px] items-center gap-2 text-muted hover:text-cyan">
              <Lock aria-hidden className="h-4 w-4" /> {t('Back to cart')}
            </Link>
          </div>
        </div>
        <div className="glow-line opacity-60" />
      </header>
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
