'use client';
import { forwardRef } from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-testid'?: string };

export const PrimaryButton = forwardRef<HTMLButtonElement, Props>(function PrimaryButton(
  { className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center',
        'h-[56px] px-6 rounded-pill',
        'bg-brand-accent text-white font-medium text-base',
        'transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
