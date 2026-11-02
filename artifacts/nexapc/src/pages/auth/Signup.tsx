import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageMeta } from '@/lib/meta';
import { useLocale } from '@/lib/i18n';
import { signupSchema, type SignupValues } from '@/lib/schemas';
import { auth } from '@/services/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { TextField, PasswordField, Checkbox, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

export default function Signup() {
  const { t } = useLocale();
  usePageMeta('Sign Up', 'Create a NexaPC account.');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
    mode: 'onTouched',
  });
  const pw = watch('password');
  return (
    <AuthShell crumbs={[{ label: t('Home'), to: '/' }, { label: t('Sign Up') }]} title={t('Create an account')} intro={t('Save details for faster checkout once accounts are connected.')}>
      <form noValidate onSubmit={handleSubmit(async (v) => { setResult(null); const r = await auth.signUp(v); if (!r.ok) setResult(r.message); }, () => setAttempt((a) => a + 1))} className="flex flex-col gap-5">
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['fullName', 'email', 'password', 'confirmPassword', 'terms'])} focusKey={attempt} />
        <div role="status" aria-live="polite">{result && <Notice tone="warn" title={t('Sign-up is not connected yet')}>{t(result)}</Notice>}</div>
        <TextField id="fullName" label={t('Full name')} autoComplete="name" required error={errors.fullName?.message ? t(errors.fullName.message) : undefined} {...register('fullName')} />
        <TextField id="email" label={t('Email')} type="email" inputMode="email" autoComplete="email" required error={errors.email?.message ? t(errors.email.message) : undefined} {...register('email')} />
        <PasswordField id="password" label={t('Password')} autoComplete="new-password" required describedExtra="pw-rules" error={errors.password?.message ? t(errors.password.message) : undefined} {...register('password')} />
        <PasswordChecklist id="pw-rules" value={pw} />
        <PasswordField id="confirmPassword" label={t('Confirm password')} autoComplete="new-password" required error={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined} {...register('confirmPassword')} />
        <Checkbox
          id="terms"
          label={<>{t('I agree to the')} <Link to="/terms" className="font-semibold text-cyan underline underline-offset-4">{t('Terms and Conditions')}</Link> {t('(required)')}</>}
          error={errors.terms?.message}
          {...register('terms')}
        />
        <Button type="submit" size="lg" full loading={isSubmitting} data-testid="button-signup">{t('Create account')}</Button>
        <p className="text-center text-muted">{t('Already have an account?')} <Link to="/login" className="font-semibold text-cyan underline-offset-4 hover:underline">{t('Login')}</Link></p>
      </form>
    </AuthShell>
  );
}
