import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageMeta } from '@/lib/meta';
import { useLocale } from '@/lib/i18n';
import { forgotSchema, type ForgotValues } from '@/lib/schemas';
import { auth } from '@/services/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

export default function ForgotPassword() {
  const { t } = useLocale();
  usePageMeta('Forgot password', 'Request a password reset for your NexaPC account.');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' }, mode: 'onTouched' });
  return (
    <AuthShell crumbs={[{ label: t('Home'), to: '/' }, { label: t('Login'), to: '/login' }, { label: t('Forgot password') }]} title={t('Forgot password')} intro={t('Enter the email for your account.')}>
      <form noValidate onSubmit={handleSubmit(async (v) => { setResult(null); const r = await auth.requestPasswordReset(v); if (!r.ok) setResult(r.message); }, () => setAttempt((a) => a + 1))} className="flex flex-col gap-5">
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['email'])} focusKey={attempt} />
        <div role="status" aria-live="polite">{result && <Notice tone="warn" title={t('Password reset is not connected yet')}>{t(result)}</Notice>}</div>
        <TextField id="email" label={t('Email')} type="email" inputMode="email" autoComplete="email" required error={errors.email?.message ? t(errors.email.message) : undefined} {...register('email')} />
        <Button type="submit" size="lg" full loading={isSubmitting}>{t('Send reset link')}</Button>
        <Link to="/login" className="inline-flex min-h-[44px] items-center justify-center font-semibold text-cyan underline-offset-4 hover:underline">{t('Back to Login')}</Link>
      </form>
    </AuthShell>
  );
}
