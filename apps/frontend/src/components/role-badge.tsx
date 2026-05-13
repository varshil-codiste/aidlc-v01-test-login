'use client';
import type { Role } from '../../../../shared/role';

interface Props {
  role: Role;
}

// LC-014 + P-A11Y-010 — text-label badge with aria-label; NOT colour-only;
// foreground/background tokens hit ≥ 4.5:1 against the header surface.
export function RoleBadge({ role }: Props) {
  const label = role === 'MERCHANT' ? 'Merchant' : 'Seller';
  return (
    <span
      data-testid="header-role-badge"
      aria-label={`You are signed in as a ${label}`}
      className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-900 text-xs font-medium px-3 py-1 ring-1 ring-neutral-300"
    >
      {label}
    </span>
  );
}
