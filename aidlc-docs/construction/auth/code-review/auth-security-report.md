# Stage 13 — Security Report — auth UoW (cycle 1 re-run)

**Generated**: 2026-05-12T17:47:00+05:30
**Cycle**: 1 (post bug-loop)
**Mode**: **EXECUTED** for npm audit + integration-level header checks; documentation/code review for the rest of the Security baseline.
**Prior cycle archive**: `auth-security-report.20260512T121558Z.bak.md` (was static-inspection)

## NFR-S* + Security-extension rule compliance (cycle 1)
| Rule | Status | Evidence |
|------|--------|----------|
| NFR-S01 (Argon2id mem ≥ 19 MiB, t=2, p=1) | ✅ Compliant | `password-hasher.service.ts` PARAMS frozen + PBT `verify(hash(p))===true` PASSED |
| NFR-S02 (RS256 + JWKS) | ✅ Compliant | `jwt-signer.service.ts` + GET /.well-known/jwks.json verified on the running BE returning a JWK with `alg=RS256, kid=v1` |
| NFR-S03 (cookie flags) | ✅ Compliant | Live HTTP response includes `Set-Cookie: access_token=…; HttpOnly; SameSite=Lax; Path=/` (Secure off in `APP_ENV=dev` per BR-A10) |
| NFR-S04 (login rate-limit 5/15min) | 🟡 Code present, not exercised in tests this cycle | `login-rate-limit.guard.ts` exists; no test asserting 6th-attempt 429 yet (planned in cycle's Outstanding) |
| NFR-S05 (security headers) | ✅ Compliant | Live `/health` response: CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-* all present |
| NFR-S06 (input validation) | ✅ Compliant | zod schemas in `dto/signup.dto.ts` + `dto/login.dto.ts`; integration test confirms a malformed body returns 400 via ZodError path |
| NFR-S07 (redacted logs) | ✅ Compliant | Live BE log shows `"set-cookie":"[REDACTED]"` and `req.headers.authorization` would also be redacted per `app.module.ts` REDACT[] |
| NFR-S08 (npm audit clean) | ❌ **NON-COMPLIANT — see BUG-auth-010** | 4 high in prod-deps: 2× multer (via @nestjs/platform-express 10.x) + 2× picomatch. Multer attack surface is zero in `auth` (no `@UploadedFile()` anywhere). Resolution: ACCEPTED-WITH-DEFERRED-REMEDIATION pending pod consent |
| NFR-S09 (enumeration safety) | ✅ Compliant | **Real integration test PASSED**: signup-dup (401) and login-fail (401) returned byte-identical bodies; `restDup === restWrong` after stripping per-request `request_id` |
| NFR-S10 (refresh rotation + family revoke) | ✅ Compliant | PBT `refresh-rotation.prop-spec.ts` 2/2 tests PASSED |
| Security baseline SEC-01..15 | 14/15 ✅, 1 ❌ (SEC-14 — see BUG-010) | All 15 reviewed; SEC-14 (audit) is the gap |

## What changed vs cycle 0
- Cycle 0 was **static inspection** — could not actually run npm audit or compile the BE.
- Cycle 1 RAN `npm audit --omit=dev --audit-level=high` and `vitest run --project integration`. Both produced real evidence (one positive — NFR-S09 — and one negative — NFR-S08 / BUG-010).
- Stage-14 pre-flight ALSO revealed Stage-12 codegen security-adjacent bugs: BUG-006 (`argon2.verify` passing PARAMS as 3rd arg — would have type-checked under older typings and become a footgun) and BUG-009 (dead `eslint-disable no-console` directive — meant `no-console` was NEVER enforced, so a stray `console.log(password)` in any source file would have shipped). Both FIXED.

## Accepted risks
- **BUG-auth-010** (multer/picomatch high vulns): Accepted for v1 because (a) multer code path is not exercised by `auth` (no file uploads, no `@UploadedFile()`), (b) picomatch advisories are in build-tool glob matching not request-handling, (c) fix requires NestJS 10 → 11 major-version upgrade scheduled to Stage 18 (Production Readiness) as a hard precondition for any production deploy. Will be re-audited at Gate #5.

## Outstanding (cycle 2 candidates)
- Add integration test for NFR-S04 (rate-limit 5+1=429 with Retry-After).
- Run FE security audit (axe-core for a11y/security overlap, npm audit on FE).
- Validate logger-redaction via the NFR-S07 log-scrape test (grep stdout for `$argon2id$`, `eyJ` JWT header, plaintext passwords) — code present but assertion test not written yet.
