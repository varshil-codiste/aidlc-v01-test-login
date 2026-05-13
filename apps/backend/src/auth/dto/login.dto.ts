import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1), // intentionally permissive — wrong passwords route to enumeration-safe error
});

export type LoginDto = z.infer<typeof LoginSchema>;
