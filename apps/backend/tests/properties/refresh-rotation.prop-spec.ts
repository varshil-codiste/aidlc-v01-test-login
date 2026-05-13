import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { hashToken } from '../../src/auth/refresh-tokens.repo';

// NFR-T02d — refresh-token rotation property:
//   - N rotations produce N+1 distinct tokens
//   - only the latest token is valid (older tokens have rotated_at != null)
//   - replay of any rotated token revokes the entire family
//
// NB: This test exercises the HASH layer and the in-memory state machine ONLY.
// The integration test in tests/integration/refresh.int-spec.ts hits Postgres
// to validate the actual DB-side rotation transaction.

interface FakeRow {
  id: string;
  family: string;
  rotatedAt: Date | null;
  revoked: boolean;
}
interface FakeStore {
  byHash: Map<string, FakeRow>;
}
function makeStore(): FakeStore {
  return { byHash: new Map() };
}
function fakeRotate(store: FakeStore, family: string, prevHash: string, newHash: string): void {
  const cur = store.byHash.get(prevHash);
  if (!cur || cur.rotatedAt !== null || cur.revoked) {
    // replay or expired — revoke family
    for (const row of store.byHash.values()) {
      if (row.family === family) row.revoked = true;
    }
    throw new Error('REPLAY');
  }
  cur.rotatedAt = new Date();
  store.byHash.set(newHash, {
    id: `id-${store.byHash.size}`,
    family,
    rotatedAt: null,
    revoked: false,
  });
}

describe('property: refresh-token rotation invariants', () => {
  it('N rotations produce N+1 distinct tokens; only latest valid', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 15 }), (n) => {
        const family = 'fam';
        const store = makeStore();
        const t0 = hashToken('token-0');
        store.byHash.set(t0, { id: 'id-0', family, rotatedAt: null, revoked: false });

        const chain = [t0];
        for (let i = 0; i < n; i++) {
          const next = hashToken(`token-${i + 1}`);
          fakeRotate(store, family, chain[chain.length - 1], next);
          chain.push(next);
        }

        // Invariant: all chain hashes distinct
        if (new Set(chain).size !== chain.length) throw new Error('hashes not distinct');

        // Invariant: only the latest token has rotatedAt === null
        const validCount = [...store.byHash.values()].filter((r) => r.rotatedAt === null && !r.revoked).length;
        if (validCount !== 1) throw new Error(`expected 1 valid token, got ${validCount}`);
      }),
      { numRuns: 50 },
    );
  });

  it('replay of any rotated token revokes the entire family', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), fc.integer({ min: 0, max: 9 }), (n, replayIdx) => {
        const family = 'fam';
        const store = makeStore();
        const t0 = hashToken('token-0');
        store.byHash.set(t0, { id: 'id-0', family, rotatedAt: null, revoked: false });

        const chain = [t0];
        for (let i = 0; i < n; i++) {
          const next = hashToken(`token-${i + 1}`);
          fakeRotate(store, family, chain[chain.length - 1], next);
          chain.push(next);
        }

        // Replay an earlier (rotated) token
        const idx = Math.min(replayIdx, chain.length - 2); // not the latest
        let threw = false;
        try {
          fakeRotate(store, family, chain[idx], hashToken('attacker-token'));
        } catch {
          threw = true;
        }
        if (!threw) throw new Error('replay did not throw');

        // Invariant: every row in family is now revoked
        const anyValid = [...store.byHash.values()].some((r) => r.family === family && !r.revoked);
        if (anyValid) throw new Error('replay did not revoke family');
      }),
      { numRuns: 50 },
    );
  });
});
