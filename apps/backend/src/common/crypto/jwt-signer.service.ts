import { Injectable, OnModuleInit } from '@nestjs/common';
import { SignJWT, jwtVerify, importPKCS8, importSPKI, exportJWK, type KeyLike, type JWK } from 'jose';

// LC-006 / P-SEC-010 / BR-A08 / NFR-SEC-002
// RS256 access (15m) + refresh (7d). Public key exposed via /.well-known/jwks.json.

const ISSUER = 'login-account-setup';
const AUD_ACCESS = 'auth-api';
const AUD_REFRESH = 'auth-refresh';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';
const ALG = 'RS256';

export interface AccessClaims {
  sub: string;
}
export interface RefreshClaims {
  sub: string;
  family_id: string;
}

@Injectable()
export class JwtSignerService implements OnModuleInit {
  private privateKey!: KeyLike;
  private publicKey!: KeyLike;
  private jwksPayload!: { keys: JWK[] };

  async onModuleInit(): Promise<void> {
    const privatePem = decodePem(process.env.JWT_PRIVATE_KEY);
    const publicPem  = decodePem(process.env.JWT_PUBLIC_KEY);
    this.privateKey = await importPKCS8(privatePem, ALG);
    this.publicKey  = await importSPKI(publicPem, ALG);

    const jwk = await exportJWK(this.publicKey);
    jwk.alg = ALG;
    jwk.use = 'sig';
    jwk.kid = 'v1';
    this.jwksPayload = { keys: [jwk] };
  }

  async signAccessToken(claims: AccessClaims): Promise<string> {
    return new SignJWT(claims as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: ALG, kid: 'v1' })
      .setIssuer(ISSUER)
      .setAudience(AUD_ACCESS)
      .setIssuedAt()
      .setExpirationTime(ACCESS_TTL)
      .sign(this.privateKey);
  }

  async signRefreshToken(claims: RefreshClaims): Promise<string> {
    return new SignJWT(claims as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: ALG, kid: 'v1' })
      .setIssuer(ISSUER)
      .setAudience(AUD_REFRESH)
      .setIssuedAt()
      .setExpirationTime(REFRESH_TTL)
      .sign(this.privateKey);
  }

  async verifyAccess(token: string): Promise<AccessClaims> {
    const { payload } = await jwtVerify(token, this.publicKey, {
      issuer: ISSUER,
      audience: AUD_ACCESS,
    });
    return { sub: String(payload.sub) };
  }

  async verifyRefresh(token: string): Promise<RefreshClaims> {
    const { payload } = await jwtVerify(token, this.publicKey, {
      issuer: ISSUER,
      audience: AUD_REFRESH,
    });
    return { sub: String(payload.sub), family_id: String(payload.family_id) };
  }

  jwks(): { keys: JWK[] } {
    return this.jwksPayload;
  }
}

function decodePem(raw: string | undefined): string {
  if (!raw) throw new Error('JWT key env var is missing');
  // Env values often arrive with `\n` escaped — un-escape them.
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}
