'use client';
import Link from 'next/link';
import { AuthGuard } from '@/auth/auth-guard';
import { useAuth } from '@/auth/use-auth';
import { PrimaryButton } from '@/components/primary-button';
import { BrandLogo } from '@/components/brand-logo';
import { RoleBadge } from '@/components/role-badge';
import { ProfileFieldRow } from '@/components/profile-field-row';

// LC-016 — BR-A16. AuthGuard with requireSetupComplete=true.
function Inner() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col items-center p-8 gap-6 bg-neutral-0">
      <BrandLogo />
      <div className="flex flex-row items-center gap-3">
        <span className="text-neutral-700">{user.displayName}</span>
        <RoleBadge role={user.role} />
      </div>
      <h1 className="text-4xl font-extrabold text-neutral-900">Your Profile</h1>
      <dl className="w-full max-w-md flex flex-col">
        <ProfileFieldRow label="Email" value={user.email} data-testid="profile-email" />
        <ProfileFieldRow label="Display name" value={user.displayName} data-testid="profile-display-name" />
        <ProfileFieldRow label="Timezone" value={user.timezone} data-testid="profile-timezone" />
        <ProfileFieldRow
          label="Account setup complete"
          value={user.accountSetupCompleted ? 'Yes' : 'No'}
          data-testid="profile-setup-complete"
        />
      </dl>
      <div className="flex flex-row gap-4 items-center">
        <PrimaryButton
          data-testid="profile-logout"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Logout
        </PrimaryButton>
        <Link
          href="/dashboard"
          data-testid="profile-back-dashboard"
          className="text-brand underline-offset-4 hover:underline text-base focus-visible:outline-2 focus-visible:outline-brand"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}
