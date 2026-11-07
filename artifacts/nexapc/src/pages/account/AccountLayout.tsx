import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MapPin, Package, Settings, User } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { usePageMeta } from '@/lib/meta';
import { backendError } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/PageHeader';
import { Notice } from '@/components/nx/feedback';
import { Button, ButtonLink } from '@/components/nx/Button';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';

const NAV = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/settings', label: 'Settings', icon: Settings },
];
export default function AccountLayout() {
  usePageMeta('My Account', 'Manage your NexaPC profile, addresses, orders and settings.');
  const { user, loading, signOut, error: authError } = useAuth();
  const { flush, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  return <>
    <PageHeader crumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]} eyebrow="Account" title="My account" />
    <div className="container-nexa py-10">
      {error && <Notice tone="warn">{error}</Notice>}
      {loading ? <p role="status">Loading your account…</p> : !user ? (
        <div className="panel mx-auto flex max-w-2xl flex-col items-center gap-5 p-10 text-center">
          <h2>You are not signed in</h2>
          <p className="text-muted">Sign in to manage your profile, saved addresses and order requests.</p>
          {authError && <Notice tone="warn">{authError}</Notice>}
          <div className="flex gap-3">
            <ButtonLink to={`/login?next=${encodeURIComponent(location.pathname)}`}>Login</ButtonLink>
            <ButtonLink to="/signup" variant="secondary">Sign Up</ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]" key={user.id}>
          <nav aria-label="Account sections" className="overflow-x-auto">
            <ul className="flex gap-2 lg:flex-col">
              {NAV.map(n => <li key={n.to} className="shrink-0">
                <NavLink to={n.to} end={n.end} data-testid={`link-account-${n.label.toLowerCase()}`} className={({ isActive }) => cn('flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-[var(--radius-control)] border px-4 font-display font-semibold uppercase tracking-[0.08em]', isActive ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line text-text hover:border-line-strong')}>
                  <n.icon aria-hidden className="h-4 w-4" />{n.label}
                </NavLink>
              </li>)}
              <li className="shrink-0">
                <Button variant="ghost" loading={busy} icon={<LogOut className="h-4 w-4" />} data-testid="button-signout" onClick={async () => {
                  setBusy(true); setError(null);
                  try { if (ready) await flush(); await signOut(); navigate('/login'); } catch (e) { setError(backendError(e)); } finally { setBusy(false); }
                }}>Sign out</Button>
              </li>
            </ul>
          </nav>
          <div className="min-w-0"><Outlet /></div>
        </div>
      )}
    </div>
  </>;
}
