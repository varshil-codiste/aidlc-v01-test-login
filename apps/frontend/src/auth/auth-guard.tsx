'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

interface Props {
  children: React.ReactNode;
  requireSetupComplete?: boolean;
}

export function AuthGuard({ children, requireSetupComplete = true }: Props) {
  const { user, isLoading, isSetupComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/');
    } else if (requireSetupComplete && !isSetupComplete) {
      router.push('/account-setup');
    } else if (!requireSetupComplete && isSetupComplete) {
      // Visiting /account-setup after completion → bounce to dashboard
      router.push('/dashboard');
    }
  }, [user, isLoading, isSetupComplete, requireSetupComplete, router]);

  if (isLoading || !user) return <div aria-busy="true">Loading…</div>;
  return <>{children}</>;
}
