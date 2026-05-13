'use client';
import { forwardRef } from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-testid'?: string };

export const OutlinedButton = forwardRef<HTMLButtonElement, Props>(function OutlinedButton(
  { className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center',
        'h-[56px] px-8 rounded-pill',
        'border-2 border-white bg-transparent text-white font-medium text-sm',
        'transition-colors hover:bg-white/10 disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
