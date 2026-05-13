'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { FormInput } from '@/components/form-input';
import { FormError } from '@/components/form-error';
import { PrimaryButton } from '@/components/primary-button';
import { useAuth } from '@/auth/use-auth';
import type { ProblemJsonError } from '@/api/client';

const Schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
type Values = z.infer<typeof Schema>;

export function SignInForm() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<Values>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4 w-full max-w-md"
      onSubmit={handleSubmit(async (values) => {
        setApiError(null);
        try {
          await login.mutateAsync(values);
        } catch (e) {
          const err = e as ProblemJsonError;
          setApiError(err.detail ?? 'Could not sign in. Try again.');
        }
      })}
    >
      <h1 className="text-4xl font-extrabold text-neutral-900">Sign In to Zone POS</h1>
      <p className="text-neutral-500 text-base">
        You need to have registered and verified as merchant, before you can proceed.
      </p>

      <FormInput
        label="Email"
        type="email"
        autoComplete="username"
        data-testid="signin-email"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormInput
        label="Password"
        type="password"
        autoComplete="current-password"
        data-testid="signin-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <FormError data-testid="signin-error" message={apiError} />

      <PrimaryButton
        type="submit"
        data-testid="signin-submit"
        disabled={!isValid || isSubmitting}
      >
        Sign In
      </PrimaryButton>
    </form>
  );
}
