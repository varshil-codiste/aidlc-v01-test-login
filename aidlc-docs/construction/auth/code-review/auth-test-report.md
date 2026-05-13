# Stage 13 — Test Report — auth UoW (cycle 1 re-run)

**Generated**: 2026-05-12T17:47:00+05:30
**Cycle**: 1 (post bug-loop)
**Mode**: **EXECUTED** — `npm install`, `prisma migrate deploy`, `npx nest build`, full `vitest run` all ran successfully in this session.
**Prior cycle archive**: `auth-test-report.20260512T121558Z.bak.md` (was static prediction)

## Headline numbers

| Suite | Files | Tests | Pass | Fail | Skip | Duration |
|-------|-------|-------|------|------|------|----------|
| BE Unit | 0 | 0 | 0 | 0 | 0 | — (no unit-spec files written; Stage 12 scoping note) |
| BE Properties (PBT) | 4 | 8 | **8** | 0 | 0 | 3.94s |
| BE Integration | 1 | 1 | **1** | 0 | 0 | 0.49s |
| FE Unit | 0 | — | — | — | — | not run (FE not exercised in cycle 1 yet) |
| E2E (Playwright) | 1 | — | — | — | — | not run (FE not started) |
| **Total executed** | **5** | **9** | **9** | **0** | **0** | **~4s** |

## Per-file results (cycle 1)

### BE PBT (Property-Based Tests) — NFR-T02 invariants
- ✅ `tests/properties/password-hash.prop-spec.ts` (2/2) — NFR-T02a: `verify(hash(p))===true` for any p ≥ 12 chars; `verify(hash(p), q)===false` for q ≠ p.
- ✅ `tests/properties/jwt-roundtrip.prop-spec.ts` (2/2) — NFR-T02b: RS256 sign+verify round-trip.
- ✅ `tests/properties/email-normalize.prop-spec.ts` (2/2) — NFR-T02c: `normalize(normalize(e))===normalize(e)` over 200 random inputs (after BUG-007 regex fix).
- ✅ `tests/properties/refresh-rotation.prop-spec.ts` (2/2) — NFR-T02d: N+1 distinct refresh tokens; only newest valid; replay revokes family.

### BE Integration
- ✅ `tests/integration/signup-enumeration.int-spec.ts` (1/1) — **NFR-S09 paired check verified**. Live HTTP against real Postgres + real RS256 keys + real Argon2id hashing. Confirmed: dup-signup body and login-fail body are byte-identical (after stripping per-request `request_id`).

## Bug-loop bugs validated by these test runs
- BUG-005 (AuthService refresh field/method collision) → tests/properties/refresh-rotation PASSES → fix verified.
- BUG-006 (argon2.verify wrong signature) → tests/properties/password-hash PASSES → fix verified at the property level.
- BUG-007 (fc.stringMatching constraints) → tests/properties/email-normalize PASSES → fix verified.
- BUG-011 (vitest config) → `npx vitest run` discovers 5 files & 9 tests → fix verified.
- BUG-012 (vitest decorator metadata) → integration test signup 201 in 135 ms (real Argon2id), NFR-S09 byte-identical paired-response assertion PASSES → fix verified (without unplugin-swc the test errored with `TypeError: Cannot read properties of undefined (reading 'signup')`).

## Coverage
Not measured this cycle — `vitest --coverage` not run. Estimated still well below NFR-MAINT-001 (80% line coverage) since only one BE integration test file is written and there are no BE unit-spec files. Stage 14 + future cycles must add:
- 1 unit-spec per service (AuthService, UsersService, JwtSignerService, PasswordHasherService)
- ≥3 integration specs (login-success, refresh-rotation-replay, account-setup-gating)
- FE component tests

## Outstanding
- BE unit-spec files (target: 5–8 files)
- BE integration tests for: login-success-cookies, refresh-rotation-replay, rate-limit-5plus1, jwks-shape, logger-redaction-scrape
- FE unit tests via @testing-library/react
- Playwright E2E full-flow run (gated by FE coming up; cycle 1 only validated the BE half)

## Verdict
✅ **PASS** for the written tests. Coverage gap acknowledged (intentional per Gate #3 scoping note and Stage-13 cycle-0 verdict caveat). Cycle 1's purpose was to verify bug-loop fixes; deeper coverage is cycle 2+ work.
