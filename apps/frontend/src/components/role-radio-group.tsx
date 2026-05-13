'use client';
import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { ROLES, type Role } from '../../../../shared/role';

interface Props {
  value: Role | null;
  onChange: (role: Role) => void;
  onBlur?: () => void;
  error?: string;
  name?: string;
}

// LC-015 + P-A11Y-009 — radio group with paired group label, native keyboard semantics,
// visible focus ring shared with FormInput.
export const RoleRadioGroup = forwardRef<HTMLFieldSetElement, Props>(function RoleRadioGroup(
  { value, onChange, onBlur, error, name = 'role' },
  ref,
) {
  const errorId = useId();
  return (
    <fieldset
      ref={ref}
      className="flex flex-col gap-2"
      aria-invalid={!!error}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="text-sm text-neutral-700">I am a…</legend>
      <div className="flex flex-row gap-6">
        {ROLES.map((role) => {
          const id = `${name}-${role.toLowerCase()}`;
          const checked = value === role;
          return (
            <label
              key={role}
              htmlFor={id}
              className={clsx(
                'flex items-center gap-2 cursor-pointer select-none',
                'rounded-md px-4 py-3 ring-1',
                checked ? 'ring-brand bg-brand/5' : 'ring-neutral-300',
                'hover:ring-brand focus-within:ring-2 focus-within:ring-brand',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={role}
                checked={checked}
                onChange={() => onChange(role)}
                onBlur={onBlur}
                data-testid={`signup-role-${role.toLowerCase()}`}
                className="h-4 w-4 accent-brand focus-visible:outline-none"
              />
              <span className="text-base text-neutral-900">
                {role === 'MERCHANT' ? 'Merchant' : 'Seller'}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <span id={errorId} className="text-sm text-danger" role="alert" data-testid="signup-role-error">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
});
