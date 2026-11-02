import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileValues } from '@/lib/schemas';
import { TextField, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';

export default function Profile() {
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: 'Demo Customer', email: 'demo@example.com', phone: '' },
    mode: 'onTouched',
  });
  return (
    <section aria-labelledby="pf-title" className="panel flex flex-col gap-6 p-6">
      <h2 id="pf-title">Profile</h2>
      <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit(async () => { await new Promise((r) => setTimeout(r, 300)); setSaved(true); }, () => { setSaved(false); setAttempt((a) => a + 1); })}>
        <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ['fullName', 'email', 'phone'])} focusKey={attempt} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="fullName" label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <TextField id="email" label="Email" type="email" inputMode="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
          <TextField id="phone" label="Phone (Kuwait)" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div role="status" aria-live="polite">{saved && <Notice tone="success" title="Changes kept in this demo only">The form is valid. Nothing was saved to an account because accounts are not connected yet.</Notice>}</div>
        <Button type="submit" loading={isSubmitting} className="w-fit">Save changes</Button>
      </form>
    </section>
  );
}
