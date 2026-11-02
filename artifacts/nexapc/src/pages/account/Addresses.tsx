import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { addressSchema, GOVERNORATES, type AddressValues } from '@/lib/schemas';
import { demoAddresses, type DemoAddress } from '@/services/demo-addresses';
import { useAsync } from '@/hooks/use-async';
import { useNxToast } from '@/components/nx/toast';
import { Dialog } from '@/components/nx/overlay';
import { TextField, Select, ErrorSummary, summarize } from '@/components/nx/fields';
import { Button } from '@/components/nx/Button';
import { Badge, EmptyState, ErrorPanel, Notice } from '@/components/nx/feedback';

const EMPTY: AddressValues = { label: '', fullName: '', phone: '', governorate: '', city: '', block: '', street: '', building: '' };
const ORDER = ['label', 'fullName', 'phone', 'governorate', 'city', 'block', 'street', 'building'];

function AddressForm({ initial, onSubmit, onCancel }: { initial: AddressValues; onSubmit: (v: AddressValues) => Promise<void>; onCancel: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: initial, mode: 'onTouched' });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => setAttempt((a) => a + 1))} className="flex flex-col gap-4">
      <ErrorSummary errors={summarize(errors as Record<string, { message?: unknown }>, ORDER, 'addr-')} focusKey={attempt} />
      <TextField id="addr-label" label="Address name" required error={errors.label?.message} {...register('label')} />
      <TextField id="addr-fullName" label="Recipient name" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
      <TextField id="addr-phone" label="Phone (Kuwait)" type="tel" inputMode="tel" required autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      <Select id="addr-governorate" label="Governorate" required placeholder="Choose a governorate" options={GOVERNORATES} error={errors.governorate?.message} {...register('governorate')} />
      <TextField id="addr-city" label="Area / city" required error={errors.city?.message} {...register('city')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField id="addr-block" label="Block" required error={errors.block?.message} {...register('block')} />
        <TextField id="addr-street" label="Street" required error={errors.street?.message} {...register('street')} />
        <TextField id="addr-building" label="Building" required error={errors.building?.message} {...register('building')} />
      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} data-testid="button-save-address">Save address</Button>
      </div>
    </form>
  );
}

export default function Addresses() {
  const toast = useNxToast();
  const { status, data, retry } = useAsync(demoAddresses.list, 'addresses');
  const [list, setList] = useState<DemoAddress[] | null>(null);
  useEffect(() => { if (data) setList(data); }, [data]);
  const [editing, setEditing] = useState<DemoAddress | 'new' | null>(null);
  const [deleting, setDeleting] = useState<DemoAddress | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (v: AddressValues) => {
    if (editing === 'new') setList(await demoAddresses.create(v));
    else if (editing) setList(await demoAddresses.update(editing.id, v));
    toast({ tone: 'success', title: editing === 'new' ? 'Address added to demo' : 'Address updated in demo', body: 'Held in memory only.' });
    setEditing(null);
  };

  return (
    <section aria-labelledby="ad-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ad-title">Addresses</h2>
        <Button onClick={() => setEditing('new')} icon={<Plus aria-hidden className="h-4 w-4" />} data-testid="button-add-address">Add address</Button>
      </div>
      <Notice tone="info">Demo data. Addresses are stored in memory for this preview and are not saved to an account.</Notice>
      {status === 'error' ? (
        <ErrorPanel body="Addresses could not be loaded." onRetry={retry} />
      ) : !list ? (
        <div className="grid gap-4 md:grid-cols-2" role="status"><span className="sr-only">Loading addresses</span><div className="skeleton h-44" /><div className="skeleton h-44" /></div>
      ) : list.length === 0 ? (
        <EmptyState icon={<MapPin aria-hidden className="h-8 w-8" />} title="No saved addresses" body="Add a delivery address to use it at checkout once accounts are connected." action={<Button onClick={() => setEditing('new')}>Add address</Button>} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="panel flex flex-col gap-3 p-5" data-testid={`card-address-${a.id}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h3>{a.label}</h3>
                {a.isDefault && <Badge tone="cyan"><Star aria-hidden className="h-3 w-3" /> Default</Badge>}
              </div>
              <p className="text-muted">{a.fullName} / {a.phone}<br />Block {a.block}, {a.street}, Building {a.building}<br />{a.city}, {a.governorate}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditing(a)} icon={<Pencil aria-hidden className="h-4 w-4" />} aria-label={`Edit ${a.label}`}>Edit</Button>
                {!a.isDefault && (
                  <Button variant="ghost" loading={busy} onClick={async () => { setBusy(true); setList(await demoAddresses.setDefault(a.id)); setBusy(false); toast({ tone: 'success', title: 'Default address set in demo' }); }} aria-label={`Set ${a.label} as default`}>Set default</Button>
                )}
                <Button variant="danger" onClick={() => setDeleting(a)} icon={<Trash2 aria-hidden className="h-4 w-4" />} aria-label={`Delete ${a.label}`}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing != null} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? 'Add address' : 'Edit address'} description="Demo only. Stored in memory.">
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
        title="Delete address?"
        description={deleting ? `"${deleting.label}" will be removed from this demo.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" loading={busy} onClick={async () => { if (!deleting) return; setBusy(true); setList(await demoAddresses.remove(deleting.id)); setBusy(false); setDeleting(null); toast({ tone: 'info', title: 'Address deleted from demo' }); }} data-testid="button-confirm-delete">Delete</Button>
          </>
        }
      >
        <p className="text-muted">This cannot be undone.</p>
      </Dialog>
    </section>
  );
}
