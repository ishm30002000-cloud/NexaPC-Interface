import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { addressSchema, GOVERNORATES, type AddressValues } from '@/lib/schemas';
import { addresses, type SavedAddress } from '@/services/customer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
import { backendError } from '@/lib/supabase';
import { useNxToast } from '@/components/nx/toast';
import { Dialog } from '@/components/nx/overlay';
import { TextField, Select, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Badge, EmptyState, ErrorPanel, Notice } from '@/components/nx/feedback';
import { useLocale } from '@/lib/i18n';

const EMPTY: AddressValues = { label: '', fullName: '', phone: '', governorate: '', city: '', block: '', street: '', building: '' };
const ORDER = ['label', 'fullName', 'phone', 'governorate', 'city', 'block', 'street', 'building'];

function AddressForm({ initial, onSubmit, onCancel }: { initial: AddressValues; onSubmit: (v: AddressValues) => Promise<void>; onCancel: () => void }) {
  const { t } = useLocale();
  const [attempt, setAttempt] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: initial, mode: 'onTouched' });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => setAttempt((a) => a + 1))} className="flex flex-col gap-4">
      <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ORDER, 'addr-')} focusKey={attempt} />
      <TextField id="addr-label" label={t('Address name')} required error={errors.label?.message ? t(errors.label.message) : undefined} {...register('label')} />
      <TextField id="addr-fullName" label={t('Recipient name')} required autoComplete="name" error={errors.fullName?.message ? t(errors.fullName.message) : undefined} {...register('fullName')} />
      <TextField id="addr-phone" label={t('Phone (Kuwait)')} type="tel" inputMode="tel" required autoComplete="tel" error={errors.phone?.message ? t(errors.phone.message) : undefined} {...register('phone')} />
      <Select id="addr-governorate" label={t('Governorate')} required placeholder={t('Choose a governorate')} options={GOVERNORATES.map((g) => ({ value: g, label: t(g) }))} error={errors.governorate?.message ? t(errors.governorate.message) : undefined} {...register('governorate')} />
      <TextField id="addr-city" label={t('Area / city')} required error={errors.city?.message ? t(errors.city.message) : undefined} {...register('city')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField id="addr-block" label={t('Block')} required error={errors.block?.message ? t(errors.block.message) : undefined} {...register('block')} />
        <TextField id="addr-street" label={t('Street')} required error={errors.street?.message ? t(errors.street.message) : undefined} {...register('street')} />
        <TextField id="addr-building" label={t('Building')} required error={errors.building?.message ? t(errors.building.message) : undefined} {...register('building')} />
      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t('Cancel')}</Button>
        <Button type="submit" loading={isSubmitting} data-testid="button-save-address">{t('Save address')}</Button>
      </div>
    </form>
  );
}

export default function Addresses() {
  const { t, locale } = useLocale();
  const toast = useNxToast();
  const { user } = useAuth();
  const cache = useQueryClient();
  const key = ['customer', user?.id, 'addresses'];
  const { status, data: list, refetch } = useQuery({ queryKey: key, queryFn: addresses.list });
  const setList = (next: SavedAddress[]) => cache.setQueryData(key, next);
  const retry = () => { void refetch(); };
  const [editing, setEditing] = useState<SavedAddress | 'new' | null>(null);
  const [deleting, setDeleting] = useState<SavedAddress | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (v: AddressValues) => {
    setActionError(null);
    try {
      if (editing === 'new') setList(await addresses.create(v));
      else if (editing) setList(await addresses.update(editing.id, v));
      toast({ tone: 'success', title: editing === 'new' ? 'Address saved' : 'Address updated' });
      setEditing(null);
    } catch (e) { setActionError(backendError(e)); }
  };

  return (
    <section aria-labelledby="ad-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ad-title">{t('Addresses')}</h2>
        <Button onClick={() => setEditing('new')} icon={<Plus aria-hidden className="h-4 w-4" />} data-testid="button-add-address">{t('Add address')}</Button>
      </div>
      {actionError && !editing && !deleting && <Notice tone="warn">{actionError}</Notice>}
      {status === 'error' ? (
        <ErrorPanel body={t('Addresses could not be loaded.')} onRetry={retry} />
      ) : !list ? (
        <div className="grid gap-4 md:grid-cols-2" role="status"><span className="sr-only">{t('Loading addresses')}</span><div className="skeleton h-44" /><div className="skeleton h-44" /></div>
      ) : list.length === 0 ? (
        <EmptyState icon={<MapPin aria-hidden className="h-8 w-8" />} title={t('No saved addresses')} body="Add a delivery address to use at checkout." action={<Button onClick={() => setEditing('new')}>{t('Add address')}</Button>} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="panel flex flex-col gap-3 p-5" data-testid={`card-address-${a.id}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h3>{a.label}</h3>
                {a.isDefault && <Badge tone="cyan"><Star aria-hidden className="h-3 w-3" /> {t('Default')}</Badge>}
              </div>
              <p className="text-muted">{a.fullName} / {a.phone}<br />{t('Block')} {a.block}, {a.street}, {t('Building')} {a.building}<br />{a.city}, {t(a.governorate)}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditing(a)} icon={<Pencil aria-hidden className="h-4 w-4" />} aria-label={`${t('Edit')} ${a.label}`}>{t('Edit')}</Button>
                {!a.isDefault && (
                  <Button variant="ghost" loading={busy} onClick={async () => {
                    setBusy(true); setActionError(null);
                    try { setList(await addresses.setDefault(a.id)); toast({ tone: 'success', title: 'Default address saved' }); }
                    catch (e) { setActionError(backendError(e)); } finally { setBusy(false); }
                  }} aria-label={`${t('Set')} ${a.label} ${t('as default')}`}>{t('Set default')}</Button>
                )}
                <Button variant="danger" onClick={() => setDeleting(a)} icon={<Trash2 aria-hidden className="h-4 w-4" />} aria-label={`${t('Delete')} ${a.label}`}>{t('Delete')}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing != null} onOpenChange={(o) => !o && setEditing(null)} title={t(editing === 'new' ? 'Add address' : 'Edit address')} description="Saved securely to your account.">
        {actionError && <Notice tone="warn">{actionError}</Notice>}
        {editing != null && (
          <AddressForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? EMPTY : { label: editing.label, fullName: editing.fullName, phone: editing.phone, governorate: editing.governorate, city: editing.city, block: editing.block, street: editing.street, building: editing.building }}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <Dialog
        open={deleting != null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('Delete address?')}
        description={deleting ? `"${deleting.label}" will be removed from your saved addresses.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>{t('Cancel')}</Button>
            <Button variant="danger" loading={busy} onClick={async () => {
              if (!deleting) return;
              setBusy(true); setActionError(null);
              try { setList(await addresses.remove(deleting.id)); setDeleting(null); toast({ tone: 'info', title: 'Address deleted' }); }
              catch (e) { setActionError(backendError(e)); } finally { setBusy(false); }
            }} data-testid="button-confirm-delete">{t('Delete')}</Button>
          </>
        }
      >
        {actionError && <Notice tone="warn">{actionError}</Notice>}
        <p className="text-muted">{t('This cannot be undone.')}</p>
      </Dialog>
    </section>
  );
}
