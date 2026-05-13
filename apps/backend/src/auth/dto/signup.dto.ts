import { z } from 'zod';
import { ROLES } from '../../../../../shared/role';

// BR-A01 (email RFC), BR-A04 (display_name 1-100), BR-A05 (password ≥ 12),
// BR-A13 + NFR-S11 (role server-side authoritative, value MUST be in shared ROLES).

export const SignupSchema = z.object({
  email: z.string().trim().email().max(254),
  displayName: z.string().trim().min(1).max(100),
  password: z.string().min(12),
  role: z.enum(ROLES),
});

export type SignupDto = z.infer<typeof SignupSchema>;
