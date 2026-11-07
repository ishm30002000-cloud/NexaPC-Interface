import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileSchema, type ProfileValues } from '@/lib/schemas';
import { useAuth } from '@/store/auth';
import { getProfile, saveProfile } from '@/services/customer';
import { backendError } from '@/lib/supabase';
import { TextField, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice, ErrorPanel } from '@/components/nx/feedback';

export default function Profile() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const key = ['customer', user?.id, 'profile'];
  const query = useQuery({ queryKey: key, queryFn: getProfile });
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema), defaultValues: { fullName: '', email: user?.email ?? '', phone: '' }, mode: 'onTouched',
  });
  useEffect(() => {
    if (query.data && !isDirty) reset({ ...query.data, email: user?.email ?? '' });
  }, [query.data, user?.email, reset, isDirty]);
  if (query.isPending) return <p role="status">Loading your profile…</p>;
  if (query.isError) return <ErrorPanel body="Your profile could not be loaded." onRetry={() => { void query.refetch(); }} />;
  return <section aria-labelledby="pf-title" className="panel flex flex-col gap-6 p-6">
    <h2 id="pf-title">Profile</h2>
    <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit(async v => {
      setResult(null);
      try {
        await saveProfile(v);
        cache.setQueryData(key, { fullName: v.fullName, phone: v.phone });
        reset(v); setOk(true); setResult('Your profile has been saved.');
      } catch (e) { setOk(false); setResult(backendError(e)); }
    }, () => setAttempt(a => a + 1))}>
      <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['fullName', 'email', 'phone'])} focusKey={attempt} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField id="fullName" label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField id="email" label="Account email" type="email" readOnly hint="Your verified sign-in email. It is not changed by this form." {...register('email')} />
        <TextField id="phone" label="Phone (Kuwait)" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      {result && <div role="status"><Notice tone={ok ? 'success' : 'warn'}>{result}</Notice></div>}
      <Button type="submit" loading={isSubmitting} className="w-fit">Save changes</Button>
    </form>
  </section>;
}
