import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePageMeta } from '@/lib/meta';
import { loginSchema, type LoginValues } from '@/lib/schemas';
import { auth } from '@/services/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField, PasswordField, Checkbox, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

export default function Login() {
  usePageMeta('Login', 'Sign in to your NexaPC account.');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', remember: false }, mode: 'onTouched' });
  const onSubmit = async (v: LoginValues) => {
    setResult(null);
    const r = await auth.signIn(v);
    if (!r.ok) setResult(r.message);
  };
  return (
    <AuthShell crumbs={[{ label: 'Home', to: '/' }, { label: 'Login' }]} title="Login" intro="Welcome back. Sign in to see your account.">
      <form noValidate onSubmit={handleSubmit(onSubmit, () => setAttempt((a) => a + 1))} className="flex flex-col gap-5">
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['email', 'password'])} focusKey={attempt} />
        <div role="status" aria-live="polite">
          {result && <Notice tone="warn" title="Sign-in is not connected yet">{result}</Notice>}
        </div>
        <TextField id="email" label="Email" type="email" inputMode="email" autoComplete="email" required error={errors.email?.message} {...register('email')} data-testid="input-email" />
        <PasswordField id="password" label="Password" autoComplete="current-password" required error={errors.password?.message} {...register('password')} data-testid="input-password" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox id="remember" label="Remember me" {...register('remember')} />
          <Link to="/forgot-password" className="inline-flex min-h-[44px] items-center font-semibold text-cyan underline-offset-4 hover:underline" data-testid="link-forgot">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" full loading={isSubmitting} data-testid="button-login">Login</Button>
        <p className="text-center text-muted">New to NexaPC? <Link to="/signup" className="font-semibold text-cyan underline-offset-4 hover:underline">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
