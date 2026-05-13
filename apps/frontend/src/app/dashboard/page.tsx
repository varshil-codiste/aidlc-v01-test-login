'use client';
import Link from 'next/link';
import { AuthGuard } from '@/auth/auth-guard';
import { useAuth } from '@/auth/use-auth';
import { PrimaryButton } from '@/components/primary-button';
import { BrandLogo } from '@/components/brand-logo';
import { RoleBadge } from '@/components/role-badge';

function Inner() {
  const { user, logout } = useAuth();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-neutral-0">
      <BrandLogo />
      <div className="flex flex-row items-center gap-3" data-testid="dashboard-header">
        <h1 className="text-5xl font-extrabold text-neutral-900" data-testid="dashboard-greeting">
          Hello, {user?.displayName ?? 'friend'}
        </h1>
        {user ? <RoleBadge role={user.role} /> : null}
      </div>
      <Link
        href="/profile"
        data-testid="dashboard-view-profile"
        className="text-brand underline-offset-4 hover:underline text-base focus-visible:outline-2 focus-visible:outline-brand"
      >
        View Profile
      </Link>
      <PrimaryButton
        data-testid="dashboard-logout"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        Logout
      </PrimaryButton>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}
