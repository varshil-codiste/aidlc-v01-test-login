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

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'Europe/London', 'America/New_York', 'America/Los_Angeles',
  'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
];

const Schema = z.object({
  displayName: z.string().trim().min(1).max(100),
  timezone: z.enum(TIMEZONES as [string, ...string[]]),
});
type Values = z.infer<typeof Schema>;

export function AccountSetupForm({ initialDisplayName }: { initialDisplayName: string }) {
  const { updateProfile } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<Values>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: { displayName: initialDisplayName, timezone: 'Asia/Kolkata' },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4 w-full max-w-md"
      onSubmit={handleSubmit(async (values) => {
        setApiError(null);
        try {
          await updateProfile.mutateAsync(values);
        } catch (e) {
          const err = e as ProblemJsonError;
          setApiError(err.detail ?? 'Could not save profile. Try again.');
        }
      })}
    >
      <h1 className="text-4xl font-extrabold text-neutral-900">Complete your account setup</h1>
      <p className="text-neutral-500">Confirm your display name and timezone.</p>

      <FormInput
        label="Display name"
        data-testid="setup-display-name"
        error={errors.displayName?.message}
        {...register('displayName')}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="tz" className="text-sm text-neutral-700">Timezone</label>
        <select
          id="tz"
          data-testid="setup-timezone"
          aria-invalid={!!errors.timezone}
          className="h-[62px] px-6 rounded-md bg-neutral-50 text-neutral-900"
          {...register('timezone')}
        >
          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <FormError data-testid="setup-error" message={apiError} />

      <PrimaryButton
        type="submit"
        data-testid="setup-submit"
        disabled={!isValid || isSubmitting}
      >
        Finish setup
      </PrimaryButton>
    </form>
  );
}
