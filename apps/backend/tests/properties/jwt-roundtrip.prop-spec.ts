import { describe, it, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { JwtSignerService } from '../../src/common/crypto/jwt-signer.service';

// NFR-T02b — verify(sign(claims)) === claims (modulo JOSE-added fields)

describe('property: JWT round-trip', () => {
  let signer: JwtSignerService;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
    process.env.JWT_PRIVATE_KEY = await exportPKCS8(privateKey);
    process.env.JWT_PUBLIC_KEY = await exportSPKI(publicKey);
    signer = new JwtSignerService();
    await signer.onModuleInit();
  });

  it('access token: verify(sign({sub})) returns the same sub', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (sub) => {
        const token = await signer.signAccessToken({ sub });
        const decoded = await signer.verifyAccess(token);
        if (decoded.sub !== sub) throw new Error(`sub mismatch ${decoded.sub} != ${sub}`);
      }),
      { numRuns: 50 },
    );
  });

  it('refresh token: verify(sign({sub, family_id})) returns the same claims', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), fc.uuid(), async (sub, family_id) => {
        const token = await signer.signRefreshToken({ sub, family_id });
        const decoded = await signer.verifyRefresh(token);
        if (decoded.sub !== sub || decoded.family_id !== family_id) {
          throw new Error('claims mismatch');
        }
      }),
      { numRuns: 50 },
    );
  });
});
