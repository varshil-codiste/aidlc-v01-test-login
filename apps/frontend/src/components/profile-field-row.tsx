'use client';

interface Props {
  label: string;
  value: string;
  'data-testid'?: string;
}

// LC-016 helper — <dl>/<dt>/<dd> semantics per P-A11Y / NFR-A09e.
export function ProfileFieldRow({ label, value, 'data-testid': testId }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 py-2 border-b border-neutral-100">
      <dt className="text-sm text-neutral-500 sm:w-40">{label}</dt>
      <dd className="text-base text-neutral-900" data-testid={testId}>{value}</dd>
    </div>
  );
}
