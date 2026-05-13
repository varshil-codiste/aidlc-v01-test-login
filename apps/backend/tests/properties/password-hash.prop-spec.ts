import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { PasswordHasherService } from '../../src/common/crypto/password-hasher.service';

// NFR-T02a — verify(hash(p)) === true for any p of length ≥ 12

describe('property: password-hash round-trip', () => {
  const hasher = new PasswordHasherService();

  it('verify(hash(p)) === true for any p of length ≥ 12', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 12, maxLength: 256 }),
        async (plain) => {
          const encoded = await hasher.hash(plain);
          const ok = await hasher.verify(plain, encoded);
          if (!ok) throw new Error(`round-trip failed for input length=${plain.length}`);
        },
      ),
      { numRuns: 25 }, // argon2 is intentionally slow → modest n
    );
  });

  it('verify(hash(p), q) === false when q !== p', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 12, maxLength: 64 }),
        fc.string({ minLength: 12, maxLength: 64 }),
        async (p, q) => {
          if (p === q) return; // skip equal pairs
          const encoded = await hasher.hash(p);
          const ok = await hasher.verify(q, encoded);
          if (ok) throw new Error('expected mismatch but verify returned true');
        },
      ),
      { numRuns: 20 },
    );
  });
});
