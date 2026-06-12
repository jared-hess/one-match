import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '../lib/auth';
import { getSupabase } from '../lib/supabase';
import { PageShell } from './PageShell';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const supabase = getSupabase();
  const [status, setStatus] = useState<'checking' | 'ready' | 'signed-out' | 'unavailable'>(
    supabase.available ? 'checking' : 'unavailable'
  );

  useEffect(() => {
    let mounted = true;

    if (!supabase.available) {
      return;
    }

    supabase.client.auth.getSession().then(({ data }) => {
      if (mounted) {
        setStatus(data.session ? 'ready' : 'signed-out');
      }
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  if (status === 'ready') {
    return <>{children}</>;
  }

  if (status === 'unavailable') {
    return (
      <PageShell
        eyebrow="Setup needed"
        title="Live DateJared is waiting for Supabase keys."
        description={supabase.available ? '' : supabase.reason}
      >
        <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">
          The route exists and renders safely without crashing. Add the public Vite Supabase URL and anon key to enable Google sign-in.
        </p>
      </PageShell>
    );
  }

  if (status === 'signed-out') {
    return (
      <PageShell eyebrow="Sign in" title="This DateJared room is private." description="Use Google sign-in to enter the MVP routes once Supabase auth is configured.">
        <button className="rounded-full bg-blush-500 px-5 py-3 text-sm font-bold text-cream-50 shadow-glow" onClick={() => void signInWithGoogle()} type="button">
          Continue with Google
        </button>
        <Link className="ml-4 text-sm font-bold text-blush-600" to="/">
          Back to welcome
        </Link>
      </PageShell>
    );
  }

  return <PageShell eyebrow="Loading" title="Preparing your DateJared room." description="Checking the local session before opening this route." />;
}
