# Test Report — auth UoW

**Generated at**: 2026-05-12T00:25:00Z
**Mode**: **NOT EXECUTED** — `vitest`, `playwright`, and `prisma migrate` were NOT run in this environment. The report below describes what WOULD be run and the AI's static prediction of pass/fail per test file based on careful reading.

## Tests written (5)

| Path | Type | Owns NFR(s) | Static prediction |
|------|------|-------------|-------------------|
| `tests/properties/password-hash.prop-spec.ts` | PBT | NFR-T02a | ✅ Pass — round-trip property holds by Argon2id construction |
| `tests/properties/jwt-roundtrip.prop-spec.ts` | PBT | NFR-T02b | ✅ Pass — RS256 sign/verify symmetric by jose construction |
| `tests/properties/email-normalize.prop-spec.ts` | PBT | NFR-T02c | ✅ Pass — `trim().toLowerCase()` is provably idempotent |
| `tests/properties/refresh-rotation.prop-spec.ts` | PBT | NFR-T02d | ✅ Pass — in-memory model machine is correct by construction (real DB-level rotation covered by deferred integration test) |
| `tests/integration/signup-enumeration.int-spec.ts` | Integration | NFR-S09 | ✅ Pass — single error builder ensures byte-identical body |

## Tests deferred (per Gate #3 scoping note) — known gap

| Path | Pattern | Why deferred |
|------|---------|--------------|
| `tests/unit/password-hasher.service.spec.ts` | round-trip + invalid-input — already covered by PBT | Repetitive boilerplate; PBT supersedes |
| `tests/unit/jwt-signer.service.spec.ts` | same | same |
| `tests/unit/invalid-credentials.spec.ts` | envelope shape assertion | trivial |
| `tests/unit/auth-cookies.spec.ts` | dev vs non-dev `Secure` flag | trivial |
| `tests/unit/request-id.middleware.spec.ts` | traceparent parse + UUID fallback | trivial |
| `tests/unit/security-headers.middleware.spec.ts` | header presence | trivial |
| `tests/integration/login.int-spec.ts` | 5+1=429 rate-limit | implementation verifiable by inspection |
| `tests/integration/refresh.int-spec.ts` | DB-level rotation + replay | PBT covers model; DB layer fully implemented |
| `tests/integration/logout.int-spec.ts` | idempotent + family revoke | trivial |
| `tests/integration/users.int-spec.ts` | me + PATCH + 401 | trivial |
| `tests/integration/health.int-spec.ts` | 200 + JSON shape | trivial |
| `tests/integration/headers.int-spec.ts` | NFR-S05 header presence | trivial |
| `tests/integration/log-scrape.int-spec.ts` | NFR-S07 log redaction proof | non-trivial — should be written |
| FE component tests × 5 | label/aria/submit-disabled | trivial |
| FE auth-guard test | redirect logic | non-trivial — should be written |
| Playwright `error-states.e2e.ts` | US-006 5+1=429 + invalid email/password | non-trivial |
| Playwright `a11y.e2e.ts` | axe-core scan × 4 routes | non-trivial |
| Playwright `security.e2e.ts` | DevTools cookies + log scrape | non-trivial |

## Summary (predicted)

| Stack | Suite | Total | Pass (predicted) | Fail | Skip |
|-------|-------|-------|------------------|------|------|
| Backend Node | unit | 0 written | n/a | 0 | 0 |
| Backend Node | integration | 1 written | 1 | 0 | 0 |
| Backend Node | properties | 4 written | 4 | 0 | 0 |
| Frontend | unit | 0 written | n/a | 0 | 0 |
| Frontend | E2E | 1 written | 1 (predicted PASS — needs real env) | 0 | 0 |

**Total tests written**: 6 (4 PBT + 1 integration + 1 E2E)

## Coverage (predicted)

NFR-MAINT-001 requires ≥ 80% line coverage on business-logic modules. Given that only **6 test files exist** and they target ~6 of the ~28 BE source files (password-hasher, jwt-signer, auth.service.normalizeEmail, refresh-tokens.repo hash, auth flow signup path), realistic line coverage estimate:

- BE business-logic files exercised: ~25-35%
- BE coverage as a whole: ~30-40% (estimated)
- **Coverage threshold = 80% → ❌ FAIL by NFR-MAINT-001**

**This is the intended signal of the Gate #3 "representative skeleton" scoping note.** The pod accepted at Gate #3 that the boilerplate test files were deferred. To pass NFR-MAINT-001:
- **Option A**: instruct AI to fill in the deferred tests (multi-turn work).
- **Option B**: explicitly accept the coverage gap with a documented Stage-14 Manual QA expansion (the pod manually executes more scenarios to compensate).
- **Option C**: relax NFR-MAINT-001 for v1 via Pod Override on the Gate #4 signoff with rationale ("learning experiment; reference impl provides patterns").

## Verdict (predicted)

- 🟡 **Conditional PASS** for the 6 tests that were written (they cover the highest-leverage invariants — all 4 PBT + the enumeration-safety paired check + the full-flow E2E).
- 🟠 **FAIL on coverage threshold** for NFR-MAINT-001 80% line target.
- Overall row in the Gate #4 verdict block: **🟠 Pass-with-gap** — written tests pass (predicted); coverage below NFR threshold (intentional per Gate #3 scoping).

The pod must explicitly accept this gap at the Gate #4 countersign or instruct fill-in. The verdict overall flips to **PROCEED-with-caveats** rather than clean PROCEED.
