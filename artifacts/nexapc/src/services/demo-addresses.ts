/**
 * DEMO ONLY — in-memory address service for the account preview.
 * Data lives in memory and is lost on refresh. Not connected to any account system.
 * A future backend must replace this with saved addresses for the signed-in user.
 */
import type { AddressValues } from '@/lib/schemas';

export interface DemoAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  block: string;
  street: string;
  building: string;
  isDefault: boolean;
}

let store: DemoAddress[] = [
  {
    id: 'demo-1',
    label: 'Sample address (demo)',
    fullName: 'Demo Customer',
    phone: '50000000',
    governorate: 'Hawalli',
    city: 'Salmiya',
    block: '0',
    street: 'Demo street',
    building: '0',
    isDefault: true,
  },
];
let seq = 2;
const tick = () => new Promise((r) => setTimeout(r, 180));
const snapshot = () => store.map((a) => ({ ...a }));

export const demoAddresses = {
  async list(): Promise<DemoAddress[]> { await tick(); return snapshot(); },
  async create(v: AddressValues): Promise<DemoAddress[]> {
    await tick();
    store = [...store, { ...v, phone: v.phone.replace(/[\s-]/g, ''), id: `demo-${seq++}`, isDefault: store.length === 0 }];
    return snapshot();
  },
  async update(id: string, v: AddressValues): Promise<DemoAddress[]> {
    await tick();
    store = store.map((a) => (a.id === id ? { ...a, ...v, phone: v.phone.replace(/[\s-]/g, '') } : a));
    return snapshot();
  },
  async remove(id: string): Promise<DemoAddress[]> {
    await tick();
    const wasDefault = store.find((a) => a.id === id)?.isDefault;
    store = store.filter((a) => a.id !== id);
    if (wasDefault && store[0]) store[0] = { ...store[0], isDefault: true };
    return snapshot();
  },
  async setDefault(id: string): Promise<DemoAddress[]> {
    await tick();
    store = store.map((a) => ({ ...a, isDefault: a.id === id }));
    return snapshot();
  },
};
