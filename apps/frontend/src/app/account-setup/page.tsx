'use client';
import { AuthGuard } from '@/auth/auth-guard';
import { useAuth } from '@/auth/use-auth';
import { AccountSetupForm } from '@/forms/account-setup-form';
import { BrandLogo } from '@/components/brand-logo';
import { RoleBadge } from '@/components/role-badge';

function Inner() {
  const { user } = useAuth();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-neutral-0">
      <BrandLogo />
      {user ? (
        <div className="flex flex-row items-center gap-3">
          <span className="text-neutral-700">{user.displayName}</span>
          <RoleBadge role={user.role} />
        </div>
      ) : null}
      <AccountSetupForm initialDisplayName={user?.displayName ?? ''} />
    </main>
  );
}

export default function AccountSetupPage() {
  return (
    <AuthGuard requireSetupComplete={false}>
      <Inner />
    </AuthGuard>
  );
}
