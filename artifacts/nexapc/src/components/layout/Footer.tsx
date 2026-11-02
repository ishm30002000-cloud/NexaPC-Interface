import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/data/products';
import { Logo } from './Logo';

export function Footer() {
  const col = 'flex flex-col gap-1';
  const a = 'inline-flex min-h-[44px] items-center text-muted transition-colors duration-150 hover:text-cyan';
  return (
    <footer className="no-print relative mt-auto border-t border-line bg-surface">
      <div className="glow-line" />
      <div className="container-nexa grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-sm text-muted">PC components, gaming monitors and accessories for builders in Kuwait. Prices shown in Kuwaiti Dinar.</p>
        </div>
        <nav aria-label="Shop categories" className={col}>
          <h2 className="mb-2 font-display text-base uppercase tracking-[0.2em] text-text">Shop</h2>
          <ul className={col}>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link className={a} to={`/products?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site" className={col}>
          <h2 className="mb-2 font-display text-base uppercase tracking-[0.2em] text-text">NexaPC</h2>
          <ul className={col}>
            <li><Link className={a} to="/about">About Us</Link></li>
            <li><Link className={a} to="/products">All Products</Link></li>
            <li><Link className={a} to="/cart">Cart</Link></li>
            <li><Link className={a} to="/terms">Terms and Conditions</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account" className={col}>
          <h2 className="mb-2 font-display text-base uppercase tracking-[0.2em] text-text">Account</h2>
          <ul className={col}>
            <li><Link className={a} to="/login">Login</Link></li>
            <li><Link className={a} to="/signup">Sign Up</Link></li>
            <li><Link className={a} to="/account">My Account</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="container-nexa py-6 text-sm text-muted">&copy; {new Date().getFullYear()} NexaPC. Product names and trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}
