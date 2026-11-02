import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageMeta } from '@/lib/meta';
import { signupSchema, type SignupValues } from '@/lib/schemas';
import { auth } from '@/services/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordChecklist } from '@/components/auth/PasswordChecklist';
import { TextField, PasswordField, Checkbox, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

export default function Signup() {
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
    <AuthShell crumbs={[{ label: 'Home', to: '/' }, { label: 'Sign Up' }]} title="Create an account" intro="Save details for faster checkout once accounts are connected.">
      <form noValidate onSubmit={handleSubmit(async (v) => { setResult(null); const r = await auth.signUp(v); if (!r.ok) setResult(r.message); }, () => setAttempt((a) => a + 1))} className="flex flex-col gap-5">
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['fullName', 'email', 'password', 'confirmPassword', 'terms'])} focusKey={attempt} />
        <div role="status" aria-live="polite">{result && <Notice tone="warn" title="Sign-up is not connected yet">{result}</Notice>}</div>
        <TextField id="fullName" label="Full name" autoComplete="name" required error={errors.fullName?.message} {...register('fullName')} />
        <TextField id="email" label="Email" type="email" inputMode="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <PasswordField id="password" label="Password" autoComplete="new-password" required describedExtra="pw-rules" error={errors.password?.message} {...register('password')} />
        <PasswordChecklist id="pw-rules" value={pw} />
        <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Checkbox
          id="terms"
          label={<>I agree to the <Link to="/terms" className="font-semibold text-cyan underline underline-offset-4">Terms and Conditions</Link> (required)</>}
          error={errors.terms?.message}
          {...register('terms')}
        />
        <Button type="submit" size="lg" full loading={isSubmitting} data-testid="button-signup">Create account</Button>
        <p className="text-center text-muted">Already have an account? <Link to="/login" className="font-semibold text-cyan underline-offset-4 hover:underline">Login</Link></p>
      </form>
    </AuthShell>
  );
}
