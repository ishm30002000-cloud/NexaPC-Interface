import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');

// This is a public browser key, never a service-role key. Database access is
// enforced by RLS and authenticated RPCs, not by trusting the browser.
export const supabase = createClient(url, key);
export const customerClient = (accessToken: string) => createClient(url, key, { accessToken: async () => accessToken });

export function callbackUrl(path = 'auth/callback') {
  return new URL(`${import.meta.env.BASE_URL}${path}`, window.location.origin).href;
}

export function backendError(error: unknown) {
  return error && typeof error === 'object' && 'message' in error
    ? String(error.message)
    : 'The server could not be reached. Please try again.';
}
