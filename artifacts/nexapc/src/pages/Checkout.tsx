import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, CreditCard, Lock } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useCart } from '@/store/cart';
import { deliverySchema, GOVERNORATES, type DeliveryValues } from '@/lib/schemas';
import { formatMoney, formatPrice } from '@/lib/money';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { TextField, TextArea, Select, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button, ButtonLink } from '@/components/nx/Button';
import { OrderSummary } from '@/components/nx/OrderSummary';
import { Notice } from '@/components/nx/feedback';
import { cn } from '@/lib/utils';
import { useLocale, productCopy } from '@/lib/i18n';
import { useAuth } from '@/store/auth';
import { useCatalog } from '@/store/catalog';
import { addresses, getProfile, submitOrder } from '@/services/customer';
import { backendError } from '@/lib/supabase';

const STEPS = ['Delivery', 'Review', 'Submit request'] as const;
const ORDER: (keyof DeliveryValues)[] = ['fullName', 'email', 'phone', 'governorate', 'city', 'block', 'street', 'building', 'notes'];

function Steps({ step }: { step: number }) {
  const { t } = useLocale();
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label={t('Checkout progress')}>
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={i === step ? 'step' : undefined}>
          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-display font-bold', i < step && 'border-cyan bg-cyan text-ink', i === step && 'border-cyan text-cyan', i > step && 'border-line-strong text-muted')}>
            {i < step ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn('font-display font-semibold uppercase tracking-[0.1em]', i === step ? 'text-text' : 'text-muted')}>
            {t(s)}
            <span className="sr-only">{i < step ? t(' (completed)') : i === step ? t(' (current step)') : ''}</span>
          </span>
          {i < STEPS.length - 1 && <span aria-hidden className={cn('hidden h-px flex-1 sm:block', i < step ? 'bg-cyan' : 'bg-line')} />}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const { locale, t } = useLocale();
  usePageMeta('Checkout', 'Enter delivery details and review your NexaPC order.');
  const { totals, ready, syncing, syncError, flush, acceptSubmitted } = useCart();
  const { user, loading } = useAuth();
  const { error: catalogError, refresh: refreshCatalog } = useCatalog();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const requestKey = useRef(crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const savedAddresses = useQuery({ queryKey: ['customer', user?.id, 'addresses'], queryFn: addresses.list, enabled: !!user });
  const profile = useQuery({ queryKey: ['customer', user?.id, 'profile'], queryFn: getProfile, enabled: !!user });
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryValues | null>(null);
  const [attempt, setAttempt] = useState(0);
  const form = useForm<DeliveryValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { fullName: '', email: '', phone: '', governorate: '', city: '', block: '', street: '', building: '', notes: '' },
    mode: 'onTouched',
  });
  const { register, handleSubmit, formState: { errors } } = form;
  const initialFilled = useRef(false);
  useEffect(() => {
    if (initialFilled.current || !user || !profile.data || !savedAddresses.data || form.formState.isDirty) return;
    initialFilled.current = true;
    const a = savedAddresses.data.find(a => a.isDefault) ?? savedAddresses.data[0];
    form.reset({
      fullName: a?.fullName ?? profile.data.fullName, email: user.email ?? '', phone: a?.phone ?? profile.data.phone,
      governorate: a?.governorate ?? '', city: a?.city ?? '', block: a?.block ?? '', street: a?.street ?? '', building: a?.building ?? '', notes: '',
    });
  }, [profile.data, savedAddresses.data, user, form]);

  if (loading) return <div className="container-nexa py-12" role="status">Checking your session…</div>;
  if (!user) return <Navigate to="/login?next=%2Fcheckout" replace />;
  if (!ready) return <div className="container-nexa py-12" role="status">{syncError ? 'Your saved cart could not be loaded. Retry sync above.' : 'Loading your saved cart…'}</div>;
  if (catalogError) return <div className="container-nexa py-12"><Notice tone="warn">Prices and availability could not be refreshed. <button onClick={refreshCatalog} className="text-cyan underline">Retry catalog</button></Notice></div>;
  if (totals.lines.length === 0) return <Navigate to="/cart" replace />;

  const goStep = (n: number) => { setStep(n); requestAnimationFrame(() => document.getElementById('step-title')?.focus()); };
  const onValid = (v: DeliveryValues) => { setDelivery(v); goStep(1); };
  const summary = summarize(errors as Record<string, { message?: unknown }>, ORDER);

  return (
    <div className="container-nexa pb-16 pt-6">
      <Breadcrumb items={[{ label: t('Home'), to: '/' }, { label: t('Cart'), to: '/cart' }, { label: t('Checkout') }]} />
      <h1 className="mt-4 text-[clamp(2rem,1.5rem+2.2vw,3.25rem)]">{t('Checkout')}</h1>
      <div className="mt-6"><Steps step={step} /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {step === 0 && (
            <form noValidate onSubmit={handleSubmit(onValid, () => setAttempt((a) => a + 1))} className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">{t('Delivery details')}</h2>
              <ErrorSummary errors={summary} focusKey={attempt} />
              <p className="text-sm text-muted">{t('All fields are required unless marked optional.')}</p>
              {!!savedAddresses.data?.length && <Select id="saved-address" label="Use a saved address" placeholder="Enter a new address" options={savedAddresses.data.map(a => ({ value: a.id, label: `${a.label}${a.isDefault ? ' (default)' : ''}` }))} onChange={e => {
                const a = savedAddresses.data?.find(a => a.id === e.target.value);
                if (!a) return;
                form.reset({ fullName: a.fullName, email: user.email ?? '', phone: a.phone, governorate: a.governorate, city: a.city, block: a.block, street: a.street, building: a.building, notes: '' });
              }} />}
              {savedAddresses.isError && <Notice tone="warn">Saved addresses could not be loaded. You can enter delivery details below, or <button className="text-cyan underline" onClick={() => { void savedAddresses.refetch(); }} type="button">retry</button>.</Notice>}
              <div className="grid gap-5 md:grid-cols-2">
                <TextField id="fullName" label={t('Full name')} required autoComplete="name" error={errors.fullName?.message ? t(errors.fullName.message) : undefined} {...register('fullName')} />
                <TextField id="email" label={t('Email')} type="email" inputMode="email" required autoComplete="email" error={errors.email?.message ? t(errors.email.message) : undefined} {...register('email')} />
                <TextField id="phone" label={t('Phone (Kuwait)')} type="tel" inputMode="tel" required autoComplete="tel" hint={t('8 digits, with or without +965')} error={errors.phone?.message ? t(errors.phone.message) : undefined} {...register('phone')} />
                <Select id="governorate" label={t('Governorate')} required placeholder={t('Choose a governorate')} options={GOVERNORATES.map((g) => ({ value: g, label: t(g) }))} error={errors.governorate?.message ? t(errors.governorate.message) : undefined} {...register('governorate')} />
                <TextField id="city" label={t('Area / city')} required autoComplete="address-level2" error={errors.city?.message ? t(errors.city.message) : undefined} {...register('city')} />
                <TextField id="block" label={t('Block')} required inputMode="numeric" error={errors.block?.message ? t(errors.block.message) : undefined} {...register('block')} />
                <TextField id="street" label={t('Street')} required autoComplete="address-line1" error={errors.street?.message ? t(errors.street.message) : undefined} {...register('street')} />
                <TextField id="building" label={t('Building / house')} required autoComplete="address-line2" error={errors.building?.message ? t(errors.building.message) : undefined} {...register('building')} />
              </div>
              <TextArea id="notes" label={t('Delivery notes')} hint={t('Floor, apartment or landmark')} error={errors.notes?.message ? t(errors.notes.message) : undefined} {...register('notes')} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <ButtonLink to="/cart" variant="ghost"><ArrowLeft aria-hidden className="rtl-mirror h-4 w-4" /> {t('Back to cart')}</ButtonLink>
                <Button type="submit" size="lg" data-testid="button-continue-review">{t('Continue to review')}</Button>
              </div>
            </form>
          )}

          {step === 1 && delivery && (
            <section className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">{t('Review your order')}</h2>
              <ul className="flex flex-col divide-y divide-line">
                {totals.lines.map((l) => (
                  <li key={l.product.id} className="flex flex-wrap justify-between gap-3 py-3">
                    <span className="min-w-0 flex-1">{productCopy(l.product, locale).name} <span className="text-muted">x {l.quantity}</span></span>
                    <span className="tabular">{l.subtotalFils == null ? t('Price pending') : formatMoney(l.subtotalFils, locale)}</span>
                  </li>
                ))}
              </ul>
              <div className="panel-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3>{t('Deliver to')}</h3>
                  <Button variant="ghost" onClick={() => goStep(0)}>{t('Edit')}</Button>
                </div>
                <p>{delivery.fullName}</p>
                <p className="text-muted">{delivery.email} / {delivery.phone}</p>
                <p className="text-muted">{t('Block')} {delivery.block}, {delivery.street}, {t('Building')} {delivery.building}, {delivery.city}, {t(delivery.governorate)}</p>
                {delivery.notes && <p className="text-muted">{t('Notes:')} {delivery.notes}</p>}
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goStep(0)}><ArrowLeft aria-hidden className="rtl-mirror h-4 w-4" /> {t('Back')}</Button>
                <Button size="lg" onClick={() => goStep(2)} data-testid="button-continue-payment">Continue to submission</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">Submit an order request</h2>
              <div className="relative grid min-h-[200px] place-items-center rounded-[var(--radius-card)] border-2 border-dashed border-line-strong bg-ink/50 p-6 text-center" data-testid="payment-placeholder">
                <div className="flex flex-col items-center gap-3">
                  <CreditCard aria-hidden className="h-10 w-10 text-muted" />
              <p className="font-display text-sm uppercase tracking-[0.2em] text-muted">Store review</p>
              <p className="text-xl font-semibold">No payment will be taken</p>
              <p className="max-w-md text-muted">Your request will be saved for review. Prices, stock and delivery charges require confirmation. This is not a paid purchase and does not reserve stock.</p>
                </div>
              </div>
              <Notice tone="info" title="Order request only">You can view the request and its status in your account after submission. Online payment is not enabled.</Notice>
              {submitError && <Notice tone="warn" title="Request could not be submitted">{submitError} Your cart has not been cleared on this page. You can retry safely.</Notice>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" disabled={submitting} onClick={() => goStep(1)}><ArrowLeft aria-hidden className="rtl-mirror h-4 w-4" /> {t('Back to review')}</Button>
                <Button size="lg" loading={submitting} disabled={syncing || !!syncError || !delivery} aria-describedby="place-note" icon={<Lock aria-hidden className="h-4 w-4" />} data-testid="button-place-order" onClick={async () => {
                  if (!delivery || submitting) return;
                  setSubmitting(true); setSubmitError(null);
                  try {
                    await flush();
                    const ref = await submitOrder(delivery, requestKey.current);
                    void cache.invalidateQueries({ queryKey: ['customer', user.id, 'orders'] });
                    navigate(`/order-confirmation/${ref}`, { replace: true });
                    acceptSubmitted();
                  } catch (e) { setSubmitError(backendError(e)); }
                  finally { setSubmitting(false); }
                }}>Submit order request</Button>
              </div>
              <p id="place-note" className="text-sm text-muted">Your saved cart is checked on the server. Repeated submissions with the same request key cannot create duplicate requests.</p>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label={t('Order summary')}>
          <div className="hidden lg:block"><OrderSummary totals={totals} /></div>
          <div className="lg:hidden"><OrderSummary totals={totals} collapsible /></div>
          <ul className="mt-4 hidden flex-col gap-2 text-sm text-muted lg:flex">
            {totals.lines.map((l) => <li key={l.product.id} className="flex justify-between gap-3"><span className="clamp-2">{productCopy(l.product, locale).name} x {l.quantity}</span><span className="shrink-0">{l.product.priceFils == null ? t('Price pending') : formatPrice(l.product.priceFils, locale)}</span></li>)}
          </ul>
        </aside>
      </div>
    </div>
  );
}
