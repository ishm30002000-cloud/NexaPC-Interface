import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, backendError } from '@/lib/supabase';

const AuthContext = createContext<{
  session: Session | null; loading: boolean; error: string | null; signOut: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useQueryClient();
  useEffect(() => {
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!alive) return;
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      setSession(data.session);
      setError(error?.message ?? null);
      setLoading(false);
    }).catch((e) => { if (alive) { setError(backendError(e)); setLoading(false); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  const uid = session?.user.id;
  useEffect(() => {
    // Never leave another customer's profile, addresses or orders in cache.
    cache.removeQueries({ predicate: (q) => q.queryKey[0] === 'customer' && q.queryKey[1] !== uid });
  }, [uid, cache]);
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    cache.removeQueries({ queryKey: ['customer'] });
    setSession(null);
  };
  return <AuthContext.Provider value={{ session, loading, error, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return { ...value, user: value.session?.user ?? null };
}
