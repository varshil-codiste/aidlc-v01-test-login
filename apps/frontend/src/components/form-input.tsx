'use client';
import { forwardRef, useId } from 'react';
import clsx from 'clsx';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  'data-testid'?: string;
}

export const FormInput = forwardRef<HTMLInputElement, Props>(function FormInput(
  { label, error, id, ...rest },
  ref,
) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1">
      {/* NFR-A11Y-001 — paired <label> (not placeholder-only). */}
      <label htmlFor={inputId} className="text-sm text-neutral-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={clsx(
          'h-[62px] px-6 rounded-md bg-neutral-50 text-base text-neutral-900',
          'placeholder:text-neutral-500',
          error ? 'ring-2 ring-danger' : 'ring-1 ring-transparent',
          'focus:outline-none',
        )}
        {...rest}
      />
      {error ? (
        <span id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
