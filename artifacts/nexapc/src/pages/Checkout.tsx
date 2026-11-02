import { useState } from 'react';
import { Navigate } from 'react-router-dom';
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

const STEPS = ['Delivery', 'Review', 'Payment'] as const;
const ORDER: (keyof DeliveryValues)[] = ['fullName', 'email', 'phone', 'governorate', 'city', 'block', 'street', 'building', 'notes'];

function Steps({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={i === step ? 'step' : undefined}>
          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-display font-bold', i < step && 'border-cyan bg-cyan text-ink', i === step && 'border-cyan text-cyan', i > step && 'border-line-strong text-muted')}>
            {i < step ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn('font-display font-semibold uppercase tracking-[0.1em]', i === step ? 'text-text' : 'text-muted')}>
            {s}
            <span className="sr-only">{i < step ? ' (completed)' : i === step ? ' (current step)' : ''}</span>
          </span>
          {i < STEPS.length - 1 && <span aria-hidden className={cn('hidden h-px flex-1 sm:block', i < step ? 'bg-cyan' : 'bg-line')} />}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  usePageMeta('Checkout', 'Enter delivery details and review your NexaPC order.');
  const { totals } = useCart();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryValues | null>(null);
  const [attempt, setAttempt] = useState(0);
  const form = useForm<DeliveryValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { fullName: '', email: '', phone: '', governorate: '', city: '', block: '', street: '', building: '', notes: '' },
    mode: 'onTouched',
  });
  const { register, handleSubmit, formState: { errors } } = form;

  if (totals.lines.length === 0) return <Navigate to="/cart" replace />;

  const goStep = (n: number) => { setStep(n); requestAnimationFrame(() => document.getElementById('step-title')?.focus()); };
  const onValid = (v: DeliveryValues) => { setDelivery(v); goStep(1); };
  const summary = summarize(errors as Record<string, { message?: unknown }>, ORDER);

  return (
    <div className="container-nexa pb-16 pt-6">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mt-4 text-[clamp(2rem,1.5rem+2.2vw,3.25rem)]">Checkout</h1>
      <div className="mt-6"><Steps step={step} /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {step === 0 && (
            <form noValidate onSubmit={handleSubmit(onValid, () => setAttempt((a) => a + 1))} className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">Delivery details</h2>
              <ErrorSummary errors={summary} focusKey={attempt} />
              <p className="text-sm text-muted">All fields are required unless marked optional.</p>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField id="fullName" label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
                <TextField id="email" label="Email" type="email" inputMode="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <TextField id="phone" label="Phone (Kuwait)" type="tel" inputMode="tel" required autoComplete="tel" hint="8 digits, with or without +965" error={errors.phone?.message} {...register('phone')} />
                <Select id="governorate" label="Governorate" required placeholder="Choose a governorate" options={GOVERNORATES} error={errors.governorate?.message} {...register('governorate')} />
                <TextField id="city" label="Area / city" required autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
                <TextField id="block" label="Block" required inputMode="numeric" error={errors.block?.message} {...register('block')} />
                <TextField id="street" label="Street" required autoComplete="address-line1" error={errors.street?.message} {...register('street')} />
                <TextField id="building" label="Building / house" required autoComplete="address-line2" error={errors.building?.message} {...register('building')} />
              </div>
              <TextArea id="notes" label="Delivery notes" hint="Floor, apartment or landmark" error={errors.notes?.message} {...register('notes')} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <ButtonLink to="/cart" variant="ghost"><ArrowLeft aria-hidden className="h-4 w-4" /> Back to cart</ButtonLink>
                <Button type="submit" size="lg" data-testid="button-continue-review">Continue to review</Button>
              </div>
            </form>
          )}

          {step === 1 && delivery && (
            <section className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">Review your order</h2>
              <ul className="flex flex-col divide-y divide-line">
                {totals.lines.map((l) => (
                  <li key={l.product.id} className="flex flex-wrap justify-between gap-3 py-3">
                    <span className="min-w-0 flex-1">{l.product.name} <span className="text-muted">x {l.quantity}</span></span>
                    <span className="tabular">{l.subtotalFils == null ? 'Price pending' : formatMoney(l.subtotalFils)}</span>
                  </li>
                ))}
              </ul>
              <div className="panel-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3>Deliver to</h3>
                  <Button variant="ghost" onClick={() => goStep(0)}>Edit</Button>
                </div>
                <p>{delivery.fullName}</p>
                <p className="text-muted">{delivery.email} / {delivery.phone}</p>
                <p className="text-muted">Block {delivery.block}, {delivery.street}, Building {delivery.building}, {delivery.city}, {delivery.governorate}</p>
                {delivery.notes && <p className="text-muted">Notes: {delivery.notes}</p>}
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goStep(0)}><ArrowLeft aria-hidden className="h-4 w-4" /> Back</Button>
                <Button size="lg" onClick={() => goStep(2)} data-testid="button-continue-payment">Continue to payment</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="panel flex flex-col gap-6 p-6" aria-labelledby="step-title">
              <h2 id="step-title" tabIndex={-1} className="focus:outline-none">Payment</h2>
              <div className="relative grid min-h-[200px] place-items-center rounded-[var(--radius-card)] border-2 border-dashed border-line-strong bg-ink/50 p-6 text-center" data-testid="payment-placeholder">
                <div className="flex flex-col items-center gap-3">
                  <CreditCard aria-hidden className="h-10 w-10 text-muted" />
                  <p className="font-display text-sm uppercase tracking-[0.2em] text-muted">Payment provider area</p>
                  <p className="text-xl font-semibold">Online payment is not available yet</p>
                  <p className="max-w-md text-muted">A payment provider will be connected here later. No payment can be taken and no order can be placed on this site today.</p>
                </div>
              </div>
              <Notice tone="warn" title="No order will be placed">Place Order is disabled until online payment is connected.</Notice>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goStep(1)}><ArrowLeft aria-hidden className="h-4 w-4" /> Back to review</Button>
                <Button size="lg" disabled aria-describedby="place-note" icon={<Lock aria-hidden className="h-4 w-4" />} data-testid="button-place-order">Place Order</Button>
              </div>
              <p id="place-note" className="text-sm text-muted">Place Order is unavailable: online payment is not connected yet.</p>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Order summary">
          <div className="hidden lg:block"><OrderSummary totals={totals} /></div>
          <div className="lg:hidden"><OrderSummary totals={totals} collapsible /></div>
          <ul className="mt-4 hidden flex-col gap-2 text-sm text-muted lg:flex">
            {totals.lines.map((l) => <li key={l.product.id} className="flex justify-between gap-3"><span className="clamp-2">{l.product.name} x {l.quantity}</span><span className="shrink-0">{formatPrice(l.product.priceFils)}</span></li>)}
          </ul>
        </aside>
      </div>
    </div>
  );
}
