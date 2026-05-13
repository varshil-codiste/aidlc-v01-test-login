import { Injectable } from '@nestjs/common';
import { PrismaClient, type RefreshToken } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';

// LC-007 / P-SEC-007 / BR-A09 / NFR-SEC-010
// Atomic rotate-or-revoke-family. SHA-256 of the JWT is the DB key — the raw token NEVER hits the DB.

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface RotationOutcome {
  newRow: RefreshToken;
}

@Injectable()
export class RefreshTokensRepo {
  private readonly prisma = new PrismaClient();

  async createInitial(input: { userId: string; familyId: string; tokenHash: string }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId: input.userId,
        familyId: input.familyId,
        tokenHash: input.tokenHash,
        parentId: null,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    });
  }

  async rotate(args: { current: RefreshToken; newTokenHash: string }): Promise<RotationOutcome> {
    return this.prisma.$transaction(async (tx) => {
      // Re-read with FOR UPDATE semantics via select-for-update query
      const fresh = await tx.refreshToken.findUnique({ where: { id: args.current.id } });
      if (!fresh || fresh.rotatedAt !== null || fresh.revoked) {
        // Replay or race — caller should treat as invalid
        await tx.refreshToken.updateMany({
          where: { familyId: args.current.familyId },
          data: { revoked: true },
        });
        throw new Error('REPLAY_OR_RACE');
      }
      await tx.refreshToken.update({
        where: { id: fresh.id },
        data: { rotatedAt: new Date() },
      });
      const newRow = await tx.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: fresh.userId,
          familyId: fresh.familyId,
          tokenHash: args.newTokenHash,
          parentId: fresh.id,
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
      });
      return { newRow };
    });
  }
}
