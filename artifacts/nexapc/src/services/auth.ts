/**
 * Auth service interface. NOT CONNECTED — no auth provider exists yet.
 * Replace `notConnectedAuth` with a real provider implementing AuthService.
 * This implementation never pretends a user signed in or an email was sent.
 */
import type { ForgotValues, LoginValues, SignupValues } from '@/lib/schemas';

export type AuthResult = { ok: true } | { ok: false; reason: 'not-connected' | 'invalid' | 'network'; message: string };

export interface AuthService {
  readonly connected: boolean;
  signIn(values: LoginValues): Promise<AuthResult>;
  signUp(values: SignupValues): Promise<AuthResult>;
  requestPasswordReset(values: ForgotValues): Promise<AuthResult>;
  changePassword(): Promise<AuthResult>;
}

const notConnected = (what: string): AuthResult => ({
  ok: false,
  reason: 'not-connected',
  message: `${what} is not connected yet. No account system exists on this site, so nothing was sent or saved.`,
});

const wait = () => new Promise((r) => setTimeout(r, 500));

export const notConnectedAuth: AuthService = {
  connected: false,
  async signIn() { await wait(); return notConnected('Sign-in'); },
  async signUp() { await wait(); return notConnected('Account creation'); },
  async requestPasswordReset() { await wait(); return notConnected('Password reset'); },
  async changePassword() { await wait(); return notConnected('Password change'); },
};

export const auth: AuthService = notConnectedAuth;
