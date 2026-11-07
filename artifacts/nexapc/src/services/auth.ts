import { supabase, callbackUrl, backendError } from '@/lib/supabase';
import type { ChangePasswordValues, ForgotValues, LoginValues, SignupValues } from '@/lib/schemas';

export type AuthResult = { ok: true; message?: string } | { ok: false; message: string };
const fail = (error: unknown): AuthResult => ({ ok: false, message: backendError(error) });

export const auth = {
  connected: true,
  async signIn(values: LoginValues): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      return error ? fail(error) : { ok: true };
    } catch (error) { return fail(error); }
  },
  async signUp(values: SignupValues): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email, password: values.password,
        options: { data: { full_name: values.fullName }, emailRedirectTo: callbackUrl() },
      });
      return error ? fail(error) : {
        ok: true,
        message: data.session ? 'Your account is ready.' : 'Check your email for a confirmation link, then return here to sign in. If you already have an account, sign in or reset your password.',
      };
    } catch (error) { return fail(error); }
  },
  async requestPasswordReset(values: ForgotValues): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: callbackUrl('reset-password') });
      return error ? fail(error) : { ok: true, message: 'If an account exists for this email, a reset link has been requested. Check your inbox and spam folder.' };
    } catch (error) { return fail(error); }
  },
  async changePassword(values: ChangePasswordValues): Promise<AuthResult> {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user?.email) return { ok: false, message: 'Sign in again before changing your password.' };
      const check = await supabase.auth.signInWithPassword({ email: data.user.email, password: values.currentPassword });
      if (check.error) return fail(check.error);
      const { error } = await supabase.auth.updateUser({ password: values.password });
      return error ? fail(error) : { ok: true, message: 'Your password has been updated.' };
    } catch (error) { return fail(error); }
  },
};
