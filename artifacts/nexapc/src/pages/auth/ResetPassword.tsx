import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PASSWORD_RULES } from '@/lib/schemas';
import { supabase, backendError } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { usePageMeta } from '@/lib/meta';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordField } from '@/components/nx/fields';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { Button, ButtonLink } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

const schema = z.object({
  password: z.string().refine(p => PASSWORD_RULES.every(r => r.test(p)), 'Meet all password requirements'),
  confirmPassword: z.string(),
}).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
type Values = z.infer<typeof schema>;
export default function ResetPassword() {
  usePageMeta('Reset password', 'Choose a new password for your NexaPC account.');
  const { user, loading } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: '', confirmPassword: '' } });
  const onSubmit = async (v: Values) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: v.password });
      if (error) throw error;
      setOk(true); setResult('Password updated. You can now use your new password to sign in.');
    } catch (e) { setOk(false); setResult(backendError(e)); }
  };
  return <AuthShell crumbs={[{ label: 'Home', to: '/' }, { label: 'Reset password' }]} title="Reset password" intro="Use the link from your password reset email.">
    {loading ? <p role="status">Checking reset session…</p> : !user ? <>
      <Notice tone="warn">This reset link is missing, expired, or already used. Request a new link.</Notice>
      <ButtonLink to="/forgot-password">Request a reset link</ButtonLink>
    </> : <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {result && <Notice tone={ok ? 'success' : 'warn'}>{result}</Notice>}
      {!ok && <>
        <PasswordField id="new-password" label="New password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
        <PasswordChecklist value={watch('password')} id="reset-password-rules" />
        <PasswordField id="confirm-password" label="Confirm password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={isSubmitting}>Update password</Button>
      </>}
      <ButtonLink to="/login" variant="secondary">Back to login</ButtonLink>
    </form>}
  </AuthShell>;
}
