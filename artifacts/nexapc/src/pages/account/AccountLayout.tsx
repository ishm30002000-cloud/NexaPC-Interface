import { createContext, useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Eye, LayoutDashboard, MapPin, Package, Settings, User } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { PageHeader } from '@/components/layout/PageHeader';
import { Notice } from '@/components/nx/feedback';
import { Button, ButtonLink } from '@/components/nx/Button';
import { LogoMark } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';

const NAV = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/settings', label: 'Settings', icon: Settings },
];

const PreviewCtx = createContext<{ exit: () => void }>({ exit: () => {} });
export const useAccountPreview = () => useContext(PreviewCtx);

function SignedOut({ onPreview }: { onPreview: () => void }) {
  const { t } = useLocale();
  return (
    <div className="panel relative mx-auto flex max-w-2xl flex-col items-center gap-5 overflow-hidden p-10 text-center">
      <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
      <LogoMark className="relative h-14 w-14" />
      <h2 className="relative">{t('You are not signed in')}</h2>
      <p className="relative max-w-md text-muted">{t('Sign in to manage your profile, addresses and orders. Accounts are not connected yet, so you can explore a demo preview of this area instead.')}</p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <ButtonLink to="/login">{t('Login')}</ButtonLink>
        <ButtonLink to="/signup" variant="secondary">{t('Sign Up')}</ButtonLink>
        <Button variant="ghost" onClick={onPreview} icon={<Eye aria-hidden className="h-4 w-4" />} data-testid="button-preview-account">{t('View demo preview')}</Button>
      </div>
    </div>
  );
}

export default function AccountLayout() {
  const { t } = useLocale();
  usePageMeta('My Account', 'Manage your NexaPC profile, addresses, orders and settings.');
  const [preview, setPreview] = useState(false);
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home'), to: '/' }, { label: t('Account') }]} eyebrow={t('Account')} title={t('My account')} />
      <div className="container-nexa py-10">
        {!preview ? (
          <SignedOut onPreview={() => setPreview(true)} />
        ) : (
          <PreviewCtx.Provider value={{ exit: () => setPreview(false) }}>
            <Notice tone="warn" title={t('Demo preview - not connected to an account system')} className="mb-8">
              {t('Everything here is sample data held in memory and is lost on refresh.')}{' '}
              <button type="button" onClick={() => setPreview(false)} className="min-h-[44px] font-semibold text-cyan underline underline-offset-4">{t('Exit preview')}</button>
            </Notice>
            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <nav aria-label={t('Account sections')} className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:overflow-visible lg:px-0">
                <ul className="flex gap-2 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:flex-col">
                  {NAV.map((n) => (
                    <li key={n.to} className="shrink-0">
                      <NavLink
                        to={n.to}
                        end={n.end}
                        className={({ isActive }) => cn('flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-[var(--radius-control)] border px-4 font-display font-semibold uppercase tracking-[0.08em] transition-colors duration-150', isActive ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line text-text hover:border-line-strong')}
                        data-testid={`link-account-${n.label.toLowerCase()}`}
                      >
                        <n.icon aria-hidden className="h-4 w-4" /> {t(n.label)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="min-w-0"><Outlet /></div>
            </div>
          </PreviewCtx.Provider>
        )}
      </div>
    </>
  );
}
