'use client';
import { AlertCircle } from 'lucide-react';

interface Props {
  message?: string | null;
  'data-testid'?: string;
}

export function FormError({ message, ...rest }: Props) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger"
      {...rest}
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />
      <span>{message}</span>
    </div>
  );
}
