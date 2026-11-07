import { supabase, customerClient } from '@/lib/supabase';
import { addressSchema, profileSchema, type AddressValues, type ProfileValues, type DeliveryValues } from '@/lib/schemas';
import type { CartLine } from '@/lib/cart-totals';

export async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in first.');
  return data.user.id;
}
export async function getProfile() {
  const id = await currentUserId();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return { fullName: data.full_name as string, phone: data.phone as string };
}
export async function saveProfile(values: ProfileValues) {
  const parsed = profileSchema.parse(values);
  const id = await currentUserId();
  const { error } = await supabase.from('profiles').update({ full_name: parsed.fullName, phone: parsed.phone }).eq('id', id).select().single();
  if (error) throw error;
}

export interface SavedAddress extends AddressValues { id: string; isDefault: boolean }
function address(a: Record<string, any>): SavedAddress {
  return { id: a.id, label: a.label, fullName: a.full_name, phone: a.phone, governorate: a.governorate, city: a.city, block: a.block, street: a.street, building: a.building, isDefault: a.is_default };
}
async function listAddresses(): Promise<SavedAddress[]> {
  const { data, error } = await supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at');
  if (error) throw error;
  return (data ?? []).map(address);
}
function addressInput(v: AddressValues) {
  const { fullName, ...rest } = addressSchema.parse(v);
  return { ...rest, full_name: fullName };
}
export const addresses = {
  list: listAddresses,
  async create(v: AddressValues) {
    const { data, error } = await supabase.from('addresses').insert(addressInput(v)).select().single();
    if (error) throw error;
    const list = await listAddresses();
    if (list.length === 1) {
      const { error } = await supabase.rpc('set_default_address', { p_id: data.id });
      if (error) throw error;
    }
    return listAddresses();
  },
  async update(id: string, v: AddressValues) {
    const { error } = await supabase.from('addresses').update(addressInput(v)).eq('id', id).select().single();
    if (error) throw error;
    return listAddresses();
  },
  async remove(id: string) {
    const { error } = await supabase.rpc('delete_address', { p_id: id });
    if (error) throw error;
    return listAddresses();
  },
  async setDefault(id: string) {
    const { error } = await supabase.rpc('set_default_address', { p_id: id });
    if (error) throw error;
    return listAddresses();
  },
};

export async function loadSavedCart(token: string): Promise<CartLine[]> {
  const { data, error } = await customerClient(token).from('cart_items').select('product_id,quantity').order('product_id');
  if (error) throw error;
  return (data ?? []).map(row => ({ productId: row.product_id as string, quantity: row.quantity as number }));
}
export async function saveCart(lines: CartLine[], token: string, merge = false) {
  const { error } = await customerClient(token).rpc('save_cart', { p_lines: lines, p_merge: merge });
  if (error) throw error;
}
export interface OrderItem {
  id: string; product_id: string; name: string; slug: string; quantity: number; unit_price_fils: number | null;
}
export interface CustomerOrder {
  id: string; reference: string; status: string; created_at: string;
  subtotal_fils: number | null; delivery: DeliveryValues; order_items: OrderItem[];
}
export async function getOrders(): Promise<CustomerOrder[]> {
  const { data, error } = await supabase.from('orders').select('*,order_items(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data as CustomerOrder[];
}
export async function getOrder(reference: string): Promise<CustomerOrder | null> {
  const { data, error } = await supabase.from('orders').select('*,order_items(*)').eq('reference', reference).maybeSingle();
  if (error) throw error;
  return data as CustomerOrder | null;
}
export async function submitOrder(delivery: DeliveryValues, requestKey: string) {
  const { data, error } = await supabase.rpc('submit_order_request', { p_delivery: delivery, p_request_key: requestKey });
  if (error) throw error;
  return data as string;
}
