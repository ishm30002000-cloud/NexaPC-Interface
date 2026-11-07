import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/schemas';
import { auth } from '@/services/auth';
import { PasswordField, ErrorSummary, summarize } from '@/components/nx/fields';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { Button } from '@/components/nx/Button';
import { useLocale } from '@/lib/i18n';
import { Notice } from '@/components/nx/feedback';

export default function Settings() {
  const { t } = useLocale();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });
  return (
    <section aria-labelledby="st-title" className="panel flex flex-col gap-6 p-6">
      <h2 id="st-title">{t('Settings')}</h2>
      <h3>{t('Change password')}</h3>
      <form noValidate className="flex max-w-lg flex-col gap-5" onSubmit={handleSubmit(async v => { setResult(null); const r = await auth.changePassword(v); setOk(r.ok); setResult(r.message ?? null); }, () => setAttempt((a) => a + 1))}>
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['currentPassword', 'password', 'confirmPassword'])} focusKey={attempt} />
        <div role="status" aria-live="polite">{result && <Notice tone={ok ? 'success' : 'warn'} title={ok ? 'Password updated' : 'Could not update password'}>{result}</Notice>}</div>
        <PasswordField id="currentPassword" label={t('Current password')} autoComplete="current-password" required error={errors.currentPassword?.message ? t(errors.currentPassword.message) : undefined} {...register('currentPassword')} />
        <PasswordField id="password" label={t('New password')} autoComplete="new-password" required describedExtra="new-pw-rules" error={errors.password?.message ? t(errors.password.message) : undefined} {...register('password')} />
        <PasswordChecklist id="new-pw-rules" value={watch('password')} />
        <PasswordField id="confirmPassword" label={t('Confirm new password')} autoComplete="new-password" required error={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined} {...register('confirmPassword')} />
        <Button type="submit" loading={isSubmitting} className="w-fit">{t('Update password')}</Button>
      </form>
    </section>
  );
}
