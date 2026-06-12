import { useEffect, useState, type ReactNode } from 'react';
import { AuthGate } from './AuthGate';
import { PageShell } from './PageShell';
import { fetchOwnProfile } from '../lib/profiles';

type JaredRouteGuardProps = {
  children: ReactNode;
};

export function JaredRouteGuard({ children }: JaredRouteGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchOwnProfile()
      .then((profile) => {
        if (mounted) {
          setAllowed(profile?.role === 'jared');
        }
      })
      .catch(() => {
        if (mounted) {
          setAllowed(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthGate>
      {allowed === true ? (
        children
      ) : (
        <PageShell
          eyebrow={allowed === null ? 'Checking Jared access' : 'Jared only'}
          title={allowed === null ? 'Verifying the protected workspace.' : 'This route is reserved for Jared.'}
          description={
            allowed === null
              ? 'The shell is confirming profile role before rendering Jared tools.'
              : 'Normal user sessions cannot view Jared inbound, match, message, profile, demo, or settings routes.'
          }
        />
      )}
    </AuthGate>
  );
}
