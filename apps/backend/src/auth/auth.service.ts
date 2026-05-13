import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PasswordHasherService } from '../common/crypto/password-hasher.service';
import { JwtSignerService } from '../common/crypto/jwt-signer.service';
import { EmailStubService } from '../common/email/email-stub.service';
import { invalidCredentialsError } from '../common/errors/invalid-credentials';
import { UsersRepo } from '../users/users.repo';
import { RefreshTokensRepo, hashToken } from './refresh-tokens.repo';
import { recordLoginFailure, clearLoginAttempts } from '../common/rate-limit/login-rate-limit.guard';
import type { SignupDto } from './dto/signup.dto';
import type { LoginDto } from './dto/login.dto';
import type { Role } from '../../../../shared/role';

export interface AuthOutcome {
  user: { id: string; email: string; displayName: string; accountSetupCompleted: boolean; role: Role };
  accessToken: string;
  refreshToken: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepo,
    private readonly refreshRepo: RefreshTokensRepo,
    private readonly hasher: PasswordHasherService,
    private readonly jwt: JwtSignerService,
    private readonly emailStub: EmailStubService,
  ) {}

  async signup(input: SignupDto, requestId: string): Promise<AuthOutcome> {
    const email = normalizeEmail(input.email);

    const existing = await this.users.findByEmail(email);
    if (existing) {
      // NFR-S09 — same envelope as login-fail. ErrorEnvelopeFilter passes the body through.
      throw new HttpException(invalidCredentialsError(requestId), 401);
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email,
      displayName: input.displayName,
      passwordHash,
      role: input.role,
    });

    this.emailStub.emit({ to: email, displayName: user.displayName, requestId });

    return this.mintAndPersistTokens(user.id, {
      id: user.id, email: user.email, displayName: user.displayName,
      accountSetupCompleted: user.accountSetupCompleted,
      role: user.role as Role,
    });
  }

  async login(input: LoginDto, requestId: string): Promise<AuthOutcome> {
    const email = normalizeEmail(input.email);
    const user = await this.users.findByEmail(email);

    if (!user || !(await this.hasher.verify(input.password, user.passwordHash))) {
      recordLoginFailure(email); // NFR-SEC-004 counter
      throw new HttpException(invalidCredentialsError(requestId), 401);
    }

    clearLoginAttempts(email);
    return this.mintAndPersistTokens(user.id, {
      id: user.id, email: user.email, displayName: user.displayName,
      accountSetupCompleted: user.accountSetupCompleted,
      role: user.role as Role,
    });
  }

  async refresh(presentedRefresh: string): Promise<AuthOutcome> {
    let claims;
    try {
      claims = await this.jwt.verifyRefresh(presentedRefresh);
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }

    const row = await this.refreshRepo.findByTokenHash(hashToken(presentedRefresh));
    if (!row || row.expiresAt < new Date() || row.revoked) {
      throw new UnauthorizedException('Refresh expired or revoked');
    }
    if (row.rotatedAt !== null) {
      // REPLAY — revoke entire family per BR-A09
      await this.refreshRepo.revokeFamily(row.familyId);
      throw new UnauthorizedException('Refresh replay detected');
    }

    const newAccess = await this.jwt.signAccessToken({ sub: claims.sub });
    const newRefresh = await this.jwt.signRefreshToken({ sub: claims.sub, family_id: row.familyId });
    try {
      await this.refreshRepo.rotate({ current: row, newTokenHash: hashToken(newRefresh) });
    } catch {
      throw new UnauthorizedException('Refresh rotation lost race');
    }

    const user = await this.users.findById(claims.sub);
    if (!user) throw new UnauthorizedException('User missing');

    return {
      user: {
        id: user.id, email: user.email, displayName: user.displayName,
        accountSetupCompleted: user.accountSetupCompleted,
        role: user.role as Role,
      },
      accessToken: newAccess,
      refreshToken: newRefresh,
    };
  }

  async logout(presentedRefresh: string | undefined): Promise<void> {
    if (!presentedRefresh) return; // BR-A04 / NFR-REL-004 idempotent
    const row = await this.refreshRepo.findByTokenHash(hashToken(presentedRefresh)).catch(() => null);
    if (row && !row.revoked) await this.refreshRepo.revokeFamily(row.familyId);
  }

  private async mintAndPersistTokens(userId: string, userDto: AuthOutcome['user']): Promise<AuthOutcome> {
    const familyId = randomUUID();
    const access = await this.jwt.signAccessToken({ sub: userId });
    const refresh = await this.jwt.signRefreshToken({ sub: userId, family_id: familyId });
    await this.refreshRepo.createInitial({
      userId,
      familyId,
      tokenHash: hashToken(refresh),
    });
    return { user: userDto, accessToken: access, refreshToken: refresh };
  }
}
