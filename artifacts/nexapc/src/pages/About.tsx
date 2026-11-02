import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { CATEGORIES } from '@/data/products';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/nx/Button';

const VALUES = [
  { t: 'Only real specifications', b: 'We list facts published for each exact model. If a detail is missing, we leave it out rather than guess.' },
  { t: 'Honest pricing', b: 'Prices are shown in Kuwaiti Dinar. If a price is not confirmed, we say so instead of showing a number.' },
  { t: 'Clear availability', b: 'Stock status is shown in words and icons, and marked pending until confirmed.' },
  { t: 'Accessible by default', b: 'Every page is built to work with a keyboard, screen readers and larger text.' },
];

const STORY = [
  { t: 'Discover', b: 'Browse by category or search by name.' },
  { t: 'Compare', b: 'Read spec tables side by side, built from real data.' },
  { t: 'Choose', b: 'Filter by brand, price and availability to narrow down.' },
  { t: 'Build', b: 'Save parts in your cart while you plan the rig.' },
];

export default function About() {
  usePageMeta('About Us', 'NexaPC makes PC and gaming technology easier to explore, compare and buy in Kuwait.');
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} eyebrow="About NexaPC" title="Hardware, explained properly" intro="NexaPC is an online store for PC enthusiasts, gamers and builders in Kuwait." />

      <section aria-labelledby="mission" className="section">
        <div className="container-nexa grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Mission</p>
            <h2 id="mission" className="mt-2">Make PC and gaming technology easier to explore, compare and buy.</h2>
          </div>
          <p className="self-end text-lg text-muted">Choosing hardware means reading a lot of numbers. We keep the catalog focused, show specifications for the exact model, and make filtering fast, so you spend less time searching and more time building.</p>
        </div>
      </section>

      <section aria-labelledby="cats" className="border-y border-line bg-surface py-14">
        <div className="container-nexa">
          <h2 id="cats">What we carry</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/products?category=${c.slug}`} className="group flex min-h-[64px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line bg-ink/40 px-4 py-3 transition-colors duration-150 hover:border-cyan">
                  <span className="font-display text-lg font-semibold">{c.name}</span>
                  <ArrowUpRight aria-hidden className="h-5 w-5 text-cyan transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="values" className="section">
        <div className="container-nexa">
          <p className="eyebrow">Our commitments</p>
          <h2 id="values" className="mt-2">What you can count on</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <li key={v.t} className="panel flex gap-5 p-6">
                <span aria-hidden className="font-display text-4xl font-bold text-purple">0{i + 1}</span>
                <div>
                  <h3>{v.t}</h3>
                  <p className="mt-2 text-muted">{v.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="story" className="relative overflow-hidden border-y border-line bg-surface-2 py-16">
        <div aria-hidden className="grid-bg absolute inset-0" />
        <div className="container-nexa relative">
          <h2 id="story">Discover. Compare. Choose. Build.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {STORY.map((s, i) => (
              <li key={s.t} className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-cyan font-display text-xl font-bold text-cyan">{i + 1}</span>
                  {i < STORY.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-cyan to-purple md:block" />}
                </div>
                <h3 className="text-2xl">{s.t}</h3>
                <p className="text-muted">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="cta" className="section">
        <div className="container-nexa flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h2 id="cta" className="max-w-xl">Ready to plan your next build?</h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/products" size="lg">Explore Products</ButtonLink>
            <ButtonLink to="/signup" size="lg" variant="secondary">Create an Account</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
