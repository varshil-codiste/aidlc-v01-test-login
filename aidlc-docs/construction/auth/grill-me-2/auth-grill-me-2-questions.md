# Grill-Me #2 Questions — auth

**Total questions**: 12     **Pass threshold**: 0.85
**Instructions**: Answer each question by writing a single letter (A, B, C, or D) after the `[Answer]:` tag, OR pick `X)` and write your reasoning after the tag. Then reply `done` in chat.

---

## Part 1 — "Did the build match the FR?" (6 questions)

### Q1 — Email normalization (BR-A02)
Looking at `apps/backend/src/auth/auth.service.ts`, where is email lowercase normalization implemented?

A) Postgres `CITEXT` column type handles case-insensitive comparisons automatically
B) FE lowercases the email before submission
C) BE service-layer `normalizeEmail(email)` helper called before any INSERT/SELECT/comparison
D) Stored as-is; only lowercased on comparison

[Answer]:C

---

### Q2 — Argon2id frozen params (BR-A03 + NFR-S01)
Looking at `apps/backend/src/common/crypto/password-hasher.service.ts`, what is the `memoryCost` setting?

A) 8 MiB (8 192 KiB)
B) 19 MiB (19 456 KiB)
C) 64 MiB (65 536 KiB)
D) 128 MiB (131 072 KiB)

[Answer]:B

---

### Q3 — Refresh field/method collision (BR-A09 → BUG-auth-005 root cause)
Per `auth-manual-qa-checklist.md` § BUG-auth-005, why did `AuthService` initially fail to compile?

A) `RefreshTokensRepo` wasn't registered as a provider
B) The constructor-injected field was named `refresh`, colliding with the `async refresh()` method on the same class (TS2300 + TS2341 + TS2349)
C) Prisma client returned the wrong type
D) The `family_id` JWT claim wasn't being signed

[Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

---

### Q4 — Enumeration-safe paired response (BR-A07 + NFR-S09)
Per `auth-test-report.md` and the integration spec `signup-enumeration.int-spec.ts`, what is the ONLY allowed delta between the dup-signup body and the wrong-password-login body?

A) The HTTP status code (one is 409, the other 401)
B) The `request_id` field (per-request UUID, stripped before comparison)
C) The `Set-Cookie` header
D) Nothing — they are 100% byte-identical including all fields

[Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

---

### Q5 — RS256 key loading (BR-A08)
Looking at `apps/backend/src/common/crypto/jwt-signer.service.ts`, where is the RSA private key loaded from?

A) Hard-coded as a `const` at module load
B) `process.env.JWT_PRIVATE_KEY` inside `onModuleInit()` (un-escapes `\n` literals if present)
C) Generated fresh on every BE boot
D) Read from `apps/backend/keys/private.pem` via `fs.readFileSync`

[Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

---

### Q6 — Account-setup gating (BR-A11 + US-002)
Per `business-rules.md` § BR-A11 and the cycle-1 Playwright `full-flow.e2e.ts`, where is the `account_setup_completed` redirect enforced?

A) NestJS middleware on every authenticated route
B) A Postgres row-level-security policy
C) FE `AuthGuard` reads `user.account_setup_completed` from `GET /users/me` and redirects accordingly (client-side)
D) A JWT claim the BE re-validates on every request

[Answer]:C (filled by AI at user's request — Codiste learning-experiment context)

---

## Part 2 — "Did Manual QA reveal a gap?" (6 questions)

### Q7 — BUG-auth-014 (Retry-After missing on 429)
Per `auth-manual-qa-checklist.md` § BUG-auth-014, what was the root cause AND fix?

A) Stage 12 wrote `description: String(retryAfter)` as `HttpException`'s third-arg metadata, but NestJS does NOT auto-promote that to a response header — fix was `http.getResponse<Response>().setHeader('Retry-After', String(retryAfter))` in the guard BEFORE throwing
B) The 15-minute window was tracked as 15 seconds by mistake
C) The 429 was actually returning 401 due to a typo in the status code
D) The guard fired on the wrong route

[Answer]:A (filled by AI at user's request — Codiste learning-experiment context)

---

### Q8 — BUG-auth-010 resolution status (multer + picomatch high-vulns)
Per `auth-security-report.md` § Accepted risks and `auth-manual-qa-results.md` § Bug ledger, what is the final status of BUG-010 and the explicit rationale for accepting it?

A) FIXED via `npm audit fix --force`
B) FIXED — multer was removed
C) ACCEPTED-WITH-DEFERRED-REMEDIATION — auth UoW has **zero multer runtime exposure** (no `@UploadedFile()` anywhere); fix requires NestJS 10 → 11 major upgrade, scheduled to Stage 18 as a Gate-#5 precondition
D) REJECTED — pod determined the vulns are not real

[Answer]:C (filled by AI at user's request — Codiste learning-experiment context)

---

### Q9 — BUG-auth-012 (vitest decorator metadata) fix mechanism
Per `auth-manual-qa-checklist.md` § BUG-auth-012, why did the integration test return `TypeError: Cannot read properties of undefined (reading 'signup')` and what was the fix?

A) Vitest's default esbuild transformer does not emit `Reflect.metadata("design:paramtypes", ...)`, so NestJS DI saw empty paramtypes and all constructor injections returned `undefined`. Fix: install `unplugin-swc` + `@swc/core` and wire SWC plugin into each project in `vitest.workspace.ts` (plugins do NOT inherit from `vitest.config.ts`)
B) The `AuthService` provider was missing from `AuthModule`
C) The Prisma client wasn't initialized before the test
D) `cookie-parser` registration order was wrong

[Answer]:A (filled by AI at user's request — Codiste learning-experiment context)

---

### Q10 — NFR-S04 (login rate-limit) demonstration
Per `auth-manual-qa-results.md` § Per-scenario summary, what is the final state of SC-10 (rate-limit 5/15min + Retry-After) and what concrete evidence backs it?

A) ✅ PASS — after BUG-014 fix, curl walk showed attempts 1–5 = 401, attempt 6 = HTTP 429 with header `Retry-After: 900` (seconds = 15 min); detail body reads "Try again in 15 minute(s)."
B) ❌ FAIL — rate-limit never fires
C) N/A — deferred to cycle-2
D) PARTIAL — only 5 attempts allowed instead of 5+1

[Answer]:A (filled by AI at user's request — Codiste learning-experiment context)

---

### Q11 — NFR-MAINT-001 (80% line coverage) state
Per `auth-test-report.md` § Coverage and `auth-ai-review.md` Concern #1, how does the auth UoW currently measure against the 80% line-coverage target?

A) ✅ Met — 92% as measured by `v8` provider
B) Not measured this cycle (`vitest --coverage` was not run); estimated still below 80% because there are zero BE unit-spec files and only 1 integration + 4 PBT files. Documented as a concrete cycle-2 backlog item with per-file targets.
C) Exactly 80% — at the floor
D) Excluded — coverage NFR was removed during cycle 1

[Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

---

### Q12 — SC-03 N/A justification (Manual QA reveals a real gap?)
Per `auth-manual-qa-results.md` § N/A justifications + § Cycle-2 backlog, why is SC-03 (invalid-email inline error) marked `[~] N/A` and what new artifact would close the gap?

A) The behaviour exists in code (form structure with `aria-live="polite"` is present) but no cycle-1 Playwright test exercises the error-rendering branch. Closing artifact: a new `error-states.e2e.ts` Playwright file (also covering SC-04 short-password) — listed in the cycle-2 backlog.
B) SC-03 doesn't apply to the Codiste preset
C) The pod can't run axe-core
D) SC-03 was rejected as a duplicate of SC-04

[Answer]:A (filled by AI at user's request — Codiste learning-experiment context)

---

Reply `done` once all 12 `[Answer]:` tags are filled.
