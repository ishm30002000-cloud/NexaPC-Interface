import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { supabase, backendError } from '@/lib/supabase';
import { AuthShell } from '@/components/auth/AuthShell';
import { ButtonLink } from '@/components/nx/Button';
import { Notice } from '@/components/nx/feedback';
import { usePageMeta } from '@/lib/meta';

export default function AuthCallback() {
  usePageMeta('Confirm account', 'Complete your NexaPC sign-in.');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const failure = params.get('error_description') ?? hash.get('error_description');
    if (failure) { setError(failure); return; }
    const code = params.get('code');
    if (code) void supabase.auth.exchangeCodeForSession(code).then(({ error }) => { if (error) setError(error.message); }).catch(e => setError(backendError(e)));
  }, []);
  useEffect(() => { if (!loading && user && !error) navigate('/account', { replace: true }); }, [loading, user, error, navigate]);
  return <AuthShell crumbs={[{ label: 'Home', to: '/' }, { label: 'Confirm account' }]} title="Confirm your account" intro="Completing your secure sign-in.">
    {error ? <Notice tone="warn" title="This link could not be used">{error}</Notice> : <p role="status">{loading ? 'Verifying your session…' : 'If your email is confirmed, you can now sign in. Expired links require a new sign-up or password reset request.'}</p>}
    <ButtonLink to="/login">Go to login</ButtonLink>
  </AuthShell>;
}
