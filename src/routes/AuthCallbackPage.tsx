import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../lib/auth';
import { PageShell } from '../components/PageShell';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthCallback()
      .then((route) => navigate(route, { replace: true }))
      .catch(() => navigate('/complete-profile', { replace: true }));
  }, [navigate]);

  return (
    <PageShell
      eyebrow="Auth callback"
      title="Finishing secure sign-in."
      description="DateJared is resolving the Google auth callback and routing you to the right next step."
    />
  );
}
