import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Filter, HardDrive, ListChecks, Save, Search } from 'lucide-react';
import { usePageMeta, assetUrl } from '@/lib/meta';
import { useAsync } from '@/hooks/use-async';
import { getProducts } from '@/services/products';
import { CATEGORIES } from '@/data/products';
import { Button, ButtonLink } from '@/components/nx/Button';
import { ProductCard, ProductCardSkeleton } from '@/components/nx/ProductCard';
import { CategoryCard } from '@/components/nx/CategoryCard';
import { ErrorPanel } from '@/components/nx/feedback';
import { LogoMark } from '@/components/layout/Logo';
import { HeroBackdrop } from '@/components/nx/HeroBackdrop';
import { useReveal } from '@/hooks/use-reveal';
import { useLocale, productCopy } from '@/lib/i18n';

const SsdArt = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="10" y="34" width="80" height="32" rx="3" />
    <rect x="18" y="42" width="14" height="16" />
    <rect x="38" y="42" width="14" height="16" />
    <rect x="58" y="42" width="10" height="16" />
    <path d="M90 44h4M90 50h4M90 56h4" />
  </svg>
);
const CoolArt = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="50" cy="50" r="36" />
    <circle cx="50" cy="50" r="6" />
    {[0, 72, 144, 216, 288].map((r) => (
      <path key={r} d="M50 44c4-14 18-20 26-14-6 4-14 10-20 16" transform={`rotate(${r} 50 50)`} />
    ))}
  </svg>
);
const GpuArt = (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="28" width="88" height="40" rx="4" />
    <circle cx="32" cy="48" r="13" />
    <circle cx="68" cy="48" r="13" />
    <path d="M14 68v8h30v-8" />
  </svg>
);

const FEATURED_CATS = [
  { slug: 'ssd-storage', art: SsdArt },
  { slug: 'pc-cooling', art: CoolArt },
  { slug: 'graphics-cards', art: GpuArt },
] as const;

function Hero() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="hero-title" className="hero-motion relative isolate overflow-hidden border-b border-line">
      <img src={assetUrl('hero-abstract.jpg')} alt="" width={1536} height={1024} className="hero-pan absolute inset-0 -z-10 h-full w-full object-cover opacity-40" fetchPriority="high" />
      <HeroBackdrop />
      <div aria-hidden className="hero-aurora pointer-events-none absolute -z-10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-ink)_15%,rgb(8_8_23/0.75)_55%,rgb(8_8_23/0.2))]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,var(--color-ink),transparent_30%)]" />
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_30%_50%,black,transparent_70%)]" />
      <div className="container-nexa grid min-h-[min(88dvh,820px)] items-center gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <div className="rise flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <span className="font-display text-xl font-bold tracking-[0.3em]">NEXA<span className="text-cyan">PC</span></span>
            <span aria-hidden className="h-px w-16 bg-gradient-to-r from-cyan to-purple" />
            <span className="eyebrow">{t('Kuwait')}</span>
          </div>
          <h1 id="hero-title" className="rise text-[clamp(2.75rem,1.6rem+5.2vw,6rem)] leading-[0.95] [animation-delay:80ms]">
            {t('Build Your')}
            <br />
            <span className="bg-gradient-to-r from-cyan via-cyan-soft to-purple bg-clip-text text-transparent">{t('Ultimate Setup')}</span>
          </h1>
          <p className="rise max-w-xl text-lg text-muted [animation-delay:160ms]">
            {t('Graphics cards, SSDs, cooling, processors and high refresh monitors from Samsung, SADES, MSI and more. Compare real specs, filter by what matters, and build with confidence.')}
          </p>
          <div className="rise flex flex-wrap gap-3 [animation-delay:240ms]">
            <ButtonLink to="/products" size="lg" data-testid="link-shop-now">
              {t('Shop Now')} <ArrowRight aria-hidden className="rtl-mirror h-5 w-5" />
            </ButtonLink>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('categories');
                el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                (el?.querySelector('h2') as HTMLElement | null)?.focus({ preventScroll: true });
              }}
              data-testid="button-explore"
            >
              {t('Explore Products')} <ArrowDown aria-hidden className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div aria-hidden className="relative hidden lg:block">
          <div className="drift relative mx-auto aspect-square w-full max-w-md">
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <defs>
                <linearGradient id="hx" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#00DDF2" />
                  <stop offset="1" stopColor="#A020F0" />
                </linearGradient>
              </defs>
              <polygon points="200,20 356,110 356,290 200,380 44,290 44,110" fill="rgb(16 16 42 / 0.6)" stroke="url(#hx)" strokeWidth="2" />
              <g className="hex-spin"><polygon points="200,70 312,135 312,265 200,330 88,265 88,135" fill="none" stroke="#2c2c5c" strokeWidth="1.5" strokeDasharray="6 10" /></g>
              <path d="M150 260V140l100 120V140" fill="none" stroke="#F7F8FF" strokeWidth="14" strokeLinecap="square" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} cx={200 + 156 * Math.cos((Math.PI / 3) * i - Math.PI / 2)} cy={200 + 180 * Math.sin((Math.PI / 3) * i - Math.PI / 2) * 0.5 + 0} r="4" fill="#00DDF2" className="node-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </svg>
          </div>
        </div>
      </div>
      <div className="relative h-px overflow-hidden bg-line">
        <div className="scan absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent" />
      </div>
    </section>
  );
}

function Categories() {
  const { locale, t } = useLocale();
  return (
    <section id="categories" aria-labelledby="cat-title" className="section">
      <div className="container-nexa">
        <p className="eyebrow">{t('Start with a category')}</p>
        <h2 id="cat-title" tabIndex={-1} className="mt-2 focus:outline-none">{t('Core of the build')}</h2>
        <ul data-reveal className="reveal-stagger mt-10 grid gap-6 md:grid-cols-3">
          {FEATURED_CATS.map((fc, i) => {
            const c = CATEGORIES.find((x) => x.slug === fc.slug)!;
            return (
              <li key={c.slug}>
              <CategoryCard slug={c.slug} name={c.name} blurb={c.blurb} index={i + 1} art={fc.art} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Monitors() {
  const { locale, t } = useLocale();
  const { status, data, retry } = useAsync(getProducts, 'home-products');
  const monitors = (data ?? []).filter((p) => p.featuredMonitor);
  return (
    <section aria-labelledby="mon-title" className="section relative overflow-hidden border-y border-line bg-surface">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-purple/25 blur-3xl" />
      <div className="container-nexa relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t('Featured gaming monitors')}</p>
            <h2 id="mon-title" className="mt-2">Samsung. SADES. MSI.</h2>
          </div>
          <Link to="/products?category=gaming-monitors" className="inline-flex min-h-[44px] items-center gap-2 font-display font-semibold uppercase tracking-[0.12em] text-cyan hover:underline">
            {t('All monitors')} <ArrowRight aria-hidden className="rtl-mirror h-4 w-4" />
          </Link>
        </div>
        {status === 'error' && <div className="mt-8"><ErrorPanel body="Monitors could not be loaded." onRetry={retry} /></div>}
        <ul data-reveal className="reveal-stagger mt-10 grid gap-6 lg:grid-cols-3">
          {status === 'loading' && !data
            ? [0, 1, 2].map((i) => <li key={i}><div className="skeleton h-[420px]" /></li>)
            : monitors.map((m) => (
                <li key={m.id}><ProductCard product={productCopy(m, locale)} /></li>
              ))}
        </ul>
      </div>
    </section>
  );
}

function Featured() {
  const { locale, t } = useLocale();
  const { status, data, retry } = useAsync(getProducts, 'home-featured');
  const items = (data ?? []).filter((p) => p.featured && !p.featuredMonitor);
  return (
    <section aria-labelledby="feat-title" className="section">
      <div className="container-nexa">
        <p className="eyebrow">{t('Featured products')}</p>
        <h2 id="feat-title" className="mt-2">{t('Hardware worth a closer look')}</h2>
        {status === 'error' ? (
          <div className="mt-8"><ErrorPanel body="Featured products could not be loaded." onRetry={retry} /></div>
        ) : (
          <ul data-reveal className="reveal-stagger mt-10 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4" aria-busy={status === 'loading'}>
            {status === 'loading' && !data
              ? [0, 1, 2, 3].map((i) => <li key={i}><ProductCardSkeleton /></li>)
              : items.map((p) => <li key={p.id}><ProductCard product={productCopy(p, locale)} /></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

function Promo() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="promo-title" className="container-nexa">
      <div data-reveal className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-2 p-8 md:p-12">
        <div aria-hidden className="promo-flow absolute inset-0 bg-[linear-gradient(120deg,rgb(0_221_242/0.18),transparent_45%,rgb(160_32_240/0.35))]" />
        <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="promo-title">{t('Explore the full catalog')}</h2>
            <p className="mt-2 max-w-xl text-muted">{t('Every product in one place. Search by name, then narrow by category, brand, price and availability.')}</p>
          </div>
          <ButtonLink to="/products" size="lg">{t('Browse all products')} <ArrowRight aria-hidden className="rtl-mirror h-5 w-5" /></ButtonLink>
        </div>
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: Filter, title: 'Filter what matters', body: 'Narrow by category, brand, price range and availability. Your filters stay in the link, so you can share or come back.' },
  { icon: ListChecks, title: 'Compare real specs', body: 'Specification tables only show data published for that exact model. Missing data is hidden, never guessed.' },
  { icon: Save, title: 'Cart saved on this device', body: 'Your cart is kept in this browser and stays in sync across open tabs.' },
  { icon: Search, title: 'Find it fast', body: 'Search by product name from any page.' },
];

function Benefits() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="ben-title" className="section">
      <div className="container-nexa grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">{t('How the site works for you')}</p>
          <h2 id="ben-title" className="mt-2">{t('Built for people who read the spec sheet')}</h2>
          <HardDrive aria-hidden className="mt-8 hidden h-24 w-24 text-purple/70 lg:block" strokeWidth={1} />
        </div>
        <ul data-reveal className="reveal-stagger grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li key={b.title} className="benefit group flex flex-col gap-3 bg-surface p-6 transition-colors duration-200 hover:bg-surface-2">
              <b.icon aria-hidden className="h-7 w-7 text-cyan transition-transform duration-200 ease-[var(--ease-nexa)] group-hover:-translate-y-0.5 group-hover:scale-110" />
              <h3>{t(b.title)}</h3>
              <p className="text-muted">{t(b.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home() {
  useReveal();
  usePageMeta('', 'NexaPC: PC components, gaming monitors, SSDs, cooling and graphics cards for gamers and builders in Kuwait.');
  return (
    <>
      <Hero />
      <Categories />
      <Monitors />
      <Featured />
      <Promo />
      <Benefits />
    </>
  );
}
