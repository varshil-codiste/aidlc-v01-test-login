// Single source of truth for the Role union — NFR-MAINT-003, BR-A14.
// FE TS union, BE zod schema, and Prisma enum MUST all match this set.

export const ROLES = ['MERCHANT', 'SELLER'] as const;
export type Role = (typeof ROLES)[number];
