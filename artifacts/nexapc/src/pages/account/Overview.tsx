import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Package, Settings, User } from 'lucide-react';
import { useCart } from '@/store/cart';

const CARDS = [
  { to: '/account/profile', icon: User, t: 'Profile', b: 'Name, email and phone.' },
  { to: '/account/addresses', icon: MapPin, t: 'Addresses', b: 'Delivery addresses in Kuwait.' },
  { to: '/account/orders', icon: Package, t: 'Orders', b: 'Track past and current orders.' },
  { to: '/account/settings', icon: Settings, t: 'Settings', b: 'Change your password.' },
];

export default function Overview() {
  const { count } = useCart();
  return (
    <section aria-labelledby="ov-title" className="flex flex-col gap-6">
      <h2 id="ov-title">Overview</h2>
      <div className="panel-2 flex flex-wrap items-center justify-between gap-4 p-5">
        <p>Welcome, <span className="font-semibold">Demo Customer</span></p>
        <Link to="/cart" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-cyan">{count} {count === 1 ? 'item' : 'items'} in your cart <ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <li key={c.to}>
            <Link to={c.to} className="panel glow-edge flex h-full items-start gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <c.icon aria-hidden className="h-6 w-6 text-cyan" />
              <span>
                <span className="block font-display text-xl font-semibold">{c.t}</span>
                <span className="text-muted">{c.b}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
