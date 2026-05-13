import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { normalizeEmail } from '../../src/auth/auth.service';

// NFR-T02c — normalize(normalize(e)) === normalize(e) (idempotence)

describe('property: email normalization is idempotent', () => {
  it('normalize is idempotent on any string-shaped email', () => {
    fc.assert(
      fc.property(
        // Real-world email-like generator: mix of letters, digits, @, ., random whitespace
        fc.tuple(
          fc.stringMatching(/^[A-Za-z0-9._%+-]{1,32}$/),
          fc.stringMatching(/^[A-Za-z0-9.-]{1,32}$/),
          fc.stringMatching(/^[A-Za-z]{2,8}$/),
          fc.constantFrom('', ' ', '\t', '  '),
          fc.constantFrom('', ' ', '\t', '  '),
        ).map(([local, host, tld, pre, post]) => `${pre}${local}@${host}.${tld}${post}`),
        (input) => {
          const once = normalizeEmail(input);
          const twice = normalizeEmail(once);
          if (once !== twice) throw new Error(`idempotence failed: ${JSON.stringify({ once, twice })}`);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('normalize lowercases', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (s) => {
        const out = normalizeEmail(s);
        if (out !== out.toLowerCase()) throw new Error('did not lowercase');
      }),
      { numRuns: 100 },
    );
  });
});
