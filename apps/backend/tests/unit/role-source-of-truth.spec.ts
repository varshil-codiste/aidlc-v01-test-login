import { describe, it, expect } from 'vitest';
import { Role as PrismaRole } from '@prisma/client';
import { ROLES } from '../../../../shared/role';
import { SignupSchema } from '../../src/auth/dto/signup.dto';

// NFR-MAINT-003 — the Role union has exactly one canonical declaration (shared/role.ts).
// Prisma enum, zod schema, and shared ROLES MUST all describe the same set.

describe('NFR-MAINT-003 single source of truth for Role', () => {
  it('Prisma Role enum matches shared ROLES', () => {
    const prismaSet = new Set(Object.values(PrismaRole));
    const sharedSet = new Set(ROLES);
    expect(prismaSet).toEqual(sharedSet);
  });

  it('zod signup schema accepts every value in ROLES', () => {
    for (const role of ROLES) {
      const result = SignupSchema.safeParse({
        email: 'x@example.com',
        displayName: 'x',
        password: 'CorrectHorseBattery42!',
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it('zod signup schema rejects values outside ROLES', () => {
    for (const bogus of ['ADMIN', 'merchant', 'seller', '', null, undefined]) {
      const result = SignupSchema.safeParse({
        email: 'x@example.com',
        displayName: 'x',
        password: 'CorrectHorseBattery42!',
        role: bogus,
      });
      expect(result.success).toBe(false);
    }
  });
});
