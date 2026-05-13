import { z } from 'zod';

// Minimal IANA timezone validation — application also accepts strings that
// Intl.DateTimeFormat resolves (we let the BE-side runtime double-check).
const TZ_RE = /^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+){1,2}$/;

export const UpdateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  timezone: z.string().regex(TZ_RE),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
