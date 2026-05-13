'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { FormInput } from '@/components/form-input';
import { FormError } from '@/components/form-error';
import { PrimaryButton } from '@/components/primary-button';
import { RoleRadioGroup } from '@/components/role-radio-group';
import { useAuth } from '@/auth/use-auth';
import type { ProblemJsonError } from '@/api/client';
import { ROLES } from '../../../../shared/role';

const Schema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  displayName: z.string().trim().min(1, 'Display name is required.').max(100),
  password: z.string().min(12, 'Password must be at least 12 characters.'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Please select a role (Merchant or Seller).' }) }),
});
type Values = z.infer<typeof Schema>;

export function SignupForm() {
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isValid } } = useForm<Values>({
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
          await signup.mutateAsync(values);
        } catch (e) {
          const err = e as ProblemJsonError;
          setApiError(err.detail ?? 'Could not create account. Try again.');
        }
      })}
    >
      <h1 className="text-4xl font-extrabold text-neutral-900">Create your account</h1>
      <p className="text-neutral-500 text-base">Use a real email so we can verify it.</p>

      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        data-testid="signup-email"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormInput
        label="Display name"
        autoComplete="name"
        data-testid="signup-display-name"
        error={errors.displayName?.message}
        {...register('displayName')}
      />
      <FormInput
        label="Password (≥ 12 chars)"
        type="password"
        autoComplete="new-password"
        data-testid="signup-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <RoleRadioGroup
            value={field.value ?? null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.role?.message}
          />
        )}
      />

      <FormError data-testid="signup-error" message={apiError} />

      <PrimaryButton
        type="submit"
        data-testid="signup-submit"
        disabled={!isValid || isSubmitting}
      >
        Create account
      </PrimaryButton>
    </form>
  );
}
