import { useEffect, useRef, useState, type FormEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/store/cart';
import { Drawer } from '@/components/nx/overlay';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/store/auth';
import { getProfile } from '@/services/customer';
import { backendError } from '@/lib/supabase';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
];

function CartButton({ onClick }: { onClick?: () => void }) {
  const { count } = useCart();
  const { t, locale } = useLocale();
  return (
    <NavLink
      to="/cart"
      onClick={onClick}
      className="relative grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border border-line-strong transition-colors duration-150 hover:border-cyan hover:text-cyan"
      aria-label={`${t('Cart')}, ${count} ${count === 1 ? t('item') : t('items')}`}
      data-testid="link-cart"
    >
      <ShoppingCart aria-hidden className="h-5 w-5" />
      {count > 0 && (
        <span aria-hidden className="tabular absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-cyan px-1 text-xs font-bold text-ink" data-testid="badge-cart-count">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  );
}

function HeaderSearch({ id, onDone }: { id: string; onDone?: () => void }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
    onDone?.();
  };
  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {t('Search products')}
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('Search hardware')}
        className="header-search-input h-11 w-full rounded-[var(--radius-control)] border border-line-strong bg-ink/60 pl-4 pr-12 text-base placeholder:text-muted/70 focus-visible:border-cyan"
        data-testid={`input-${id}`}
      />
      <button type="submit" aria-label={t('Submit search')} className="header-search-submit absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted hover:text-cyan">
        <Search aria-hidden className="h-5 w-5" />
      </button>
    </form>
  );
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative inline-flex min-h-[44px] items-center px-3 font-display text-[1.05rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-150 hover:text-cyan',
    isActive ? 'text-cyan after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:bg-cyan' : 'text-text',
  );

export function Header() {
  const { t } = useLocale();
  const { user, loading, signOut } = useAuth();
  const { ready, flush } = useCart();
  const profile = useQuery({
    queryKey: ['customer', user?.id, 'profile'],
    queryFn: getProfile,
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: user ? 60_000 : false,
  });
  const name = profile.data
    ? profile.data.fullName.trim()
    : typeof user?.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
  const identity = name || user?.email || 'My account';
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const burger = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => setLogoutError(null), [user?.id]);
  const logout = async () => {
    setSigningOut(true);
    setLogoutError(null);
    try {
      // Do not discard pending private-cart changes when signing out.
      if (ready) await flush();
      await signOut();
      setOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      setLogoutError(backendError(error));
    } finally {
      setSigningOut(false);
    }
  };
  const logoutClass = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line-strong px-3 text-sm font-semibold hover:border-cyan hover:text-cyan disabled:cursor-wait disabled:opacity-60';
  return (
    <header className="no-print sticky top-0 border-b border-line/80 bg-ink/85 backdrop-blur-xl" style={{ zIndex: 'var(--z-header)' }}>
      <div className="container-nexa flex h-[var(--header-h)] items-center gap-4">
        <Logo />
        <nav aria-label={t('Main')} className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
              <NavLink to={n.to} end={n.end} className={linkCls} data-testid={`link-nav-${n.label.toLowerCase().replace(/\s/g, '-')}`}>
                  {t(n.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden min-w-0 flex-1 max-w-xs lg:block">
          <HeaderSearch id="header-search" />
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {loading ? <span className="hidden text-sm text-muted lg:block" role="status">Loading account…</span> : user ? (
            <>
              <NavLink to="/account" aria-label={`My account: ${identity}`} title={user.email} className="hidden min-h-11 min-w-0 items-center gap-2 px-2 text-sm font-semibold hover:text-cyan lg:inline-flex" data-testid="link-login">
                <User aria-hidden className="h-5 w-5 shrink-0" />
                <span className="max-w-[120px] truncate xl:max-w-[160px]" data-testid="navbar-user">{identity}</span>
              </NavLink>
              <button type="button" disabled={signingOut} onClick={logout} className={cn(logoutClass, 'hidden lg:inline-flex')} data-testid="button-navbar-logout">
                <LogOut aria-hidden className="h-4 w-4" />{signingOut ? 'Signing out…' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={(s) => cn(linkCls(s), 'hidden gap-2 lg:inline-flex')} data-testid="link-login">
                <User aria-hidden className="h-5 w-5" />{t('Login')}
              </NavLink>
              <NavLink to="/signup" className="hidden min-h-11 shrink-0 items-center px-2 text-sm font-semibold text-cyan hover:underline lg:inline-flex" data-testid="link-signup">Sign Up</NavLink>
            </>
          )}
          <CartButton />
          <button
            ref={burger}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border border-line-strong hover:border-cyan lg:hidden"
            aria-label={t('Open menu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
            data-testid="button-menu"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>
      {user && (
        <div className="container-nexa flex min-w-0 items-center justify-between gap-3 border-t border-line py-2 lg:hidden">
          <NavLink to="/account" aria-label={`My account: ${identity}`} className="flex min-h-11 min-w-0 items-center gap-2 text-sm font-semibold hover:text-cyan">
            <User aria-hidden className="h-4 w-4 shrink-0" /><span className="truncate" data-testid="navbar-user-mobile">{identity}</span>
          </NavLink>
          <button type="button" disabled={signingOut} onClick={logout} className={logoutClass} data-testid="button-navbar-logout-mobile">
            <LogOut aria-hidden className="h-4 w-4" />{signingOut ? 'Signing out…' : 'Logout'}
          </button>
        </div>
      )}
      <div className="glow-line opacity-60" />
      {logoutError && <p role="alert" className="container-nexa py-3 text-sm text-danger">{logoutError} You are still signed in; please retry Logout.</p>}
      <Drawer open={open} onOpenChange={setOpen} title={t('Menu')} id="mobile-nav">
        <div className="flex flex-col gap-6">
          <HeaderSearch id="drawer-search" onDone={() => setOpen(false)} />
          <nav aria-label={t('Mobile')}>
            <ul className="flex flex-col">
              {[...NAV, ...(user
                ? [{ to: '/account', label: 'Account', end: false }]
                : [{ to: '/login', label: 'Login', end: false }, { to: '/signup', label: 'Sign Up', end: false }])].map((n) => (
                <li key={n.to} className="border-b border-line">
                  <NavLink to={n.to} end={n.end} className={(s) => cn(linkCls(s), 'w-full py-3 text-xl after:hidden')}>
                  {t(n.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {user && <div className="flex min-w-0 flex-col gap-3">
            <p className="break-all text-sm text-muted">{user.email}</p>
            <button type="button" disabled={signingOut} onClick={logout} className={logoutClass}>{signingOut ? 'Signing out…' : 'Logout'}</button>
          </div>}
          <div className="flex items-center gap-3">
            <CartButton />
            <span className="text-muted">{t('Your cart')}</span>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
