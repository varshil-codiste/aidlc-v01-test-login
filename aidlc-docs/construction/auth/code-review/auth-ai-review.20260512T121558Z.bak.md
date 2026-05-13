# AI Review — auth UoW

**Reviewing model**: Claude Opus 4.7 (1M context)
**Reviewed at**: 2026-05-12T00:25:00Z
**Files reviewed**: 48 source + 5 test = 53

## Findings

### Category: Correctness vs Functional Design

- ✅ **BR-A01** (email format) — enforced in `signup.dto.ts` + `login.dto.ts` zod `.email().max(254)`.
- ✅ **BR-A02** (email lowercase normalize in app code) — `auth.service.ts:normalizeEmail` called on every entry path; PBT proves idempotence.
- ✅ **BR-A03** (Argon2id frozen params) — `password-hasher.service.ts:PARAMS` literal const, never read from env.
- ✅ **BR-A04** (display_name 1-100) — enforced in both signup and update-profile DTOs.
- ✅ **BR-A05** (password ≥ 12 chars) — enforced in signup DTO; login DTO intentionally permissive (routes wrong-password to enumeration-safe error per BR-A07).
- ✅ **BR-A06** (5/15min rate limit) — `login-rate-limit.guard.ts` with in-memory map; `MAX_ATTEMPTS=5`, `WINDOW_MS=15*60*1000`.
- ✅ **BR-A07** (enumeration safety) — `invalid-credentials.ts` single builder; `auth.service.ts:signup` and `:login` both throw `new HttpException(invalidCredentialsError(requestId), 401)`. Integration test asserts byte-identical body.
- ✅ **BR-A08** (RS256 + JWKS) — `jwt-signer.service.ts:onModuleInit` loads PEMs from env, exports JWK with `kid:'v1'`; `jwks.controller.ts` serves `/.well-known/jwks.json`.
- ✅ **BR-A09** (refresh rotation + family revoke on replay) — `refresh-tokens.repo.ts:rotate` runs in a single `$transaction`; replay branch executes `updateMany({where:{familyId},data:{revoked:true}})` then throws `REPLAY_OR_RACE`. PBT verifies the state-machine.
- ✅ **BR-A10** (cookie flags) — `auth-cookies.ts:commonOpts()` returns `{httpOnly: true, secure: process.env.APP_ENV !== 'dev', sameSite: 'lax', path: '/'}`.
- ✅ **BR-A11** (account-setup gating) — `auth-guard.tsx` reads `user.account_setup_completed` and redirects.
- ✅ **BR-A12** (log redactor) — `app.module.ts` `LoggerModule.forRoot.pinoHttp.redact.paths` covers `*.password`, `*.passwordHash`, `*.accessToken`, `*.refreshToken`, `req.headers.authorization`, `req.headers.cookie`, `res.headers["set-cookie"]`.

### Category: Correctness vs NFR Design

- ✅ **P-RES-001** (idempotent logout) — `auth.service.ts:logout` returns when token missing.
- ✅ **P-RES-002** (fail-fast bootstrap) — `main.ts:assertEnv` exits 1 before HTTP server starts.
- ✅ **P-SCAL-001** (in-memory rate-limit + Redis switchover note) — implementation in `login-rate-limit.guard.ts`; documentation in code comment.
- ✅ **P-PERF-001** (connection pool) — Prisma default pool size = 10, matches Stage 10 Q1.
- ✅ **P-PERF-002** (response payload < 4 KB) — `users.service.ts:sanitize` is whitelist-only.
- ✅ **P-PERF-003** (FE SSR + code-split) — Next.js App Router; client components only where needed.
- ✅ **P-SEC-001** through **P-SEC-010** — all implemented in named files (cross-referenced in summary).
- ✅ **P-OBS-001/002/003** — request-id middleware + JSON logs + health endpoint.

### Category: Cross-stack contract adherence

- ✅ FE `api/client.ts` paths match BE controller paths: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/users/me`, `/users/me/profile`.
- ✅ FE `UserDto` interface in `api/client.ts` matches BE `users.service.ts:UserDto` (id, email, displayName, timezone, verified, accountSetupCompleted).
- ✅ FE `ProblemJsonError` interface matches BE `invalid-credentials.ts:ProblemJson` (type, title, status, detail, request_id).
- ⚠️ **Concern**: `apps/backend/openapi.yaml` was deferred to `@nestjs/swagger` auto-generation (no hand-written spec committed). If the OpenAPI emit at build differs from what `api/client.ts` expects, a contract drift could surface. Recommend running `npm run codegen:api` and committing `apps/frontend/src/api/schema.ts` once during CI bootstrap to catch this.

### Category: Codiste / team conventions

- ✅ Every interactive FE element has `data-testid` per `frontend-components.md` catalog (signin-email/password/submit/error; signup-email/display-name/password/submit/error; setup-display-name/timezone/submit/error; dashboard-greeting/logout; landing-signup-cta/logo).
- ✅ JSON-structured logs in `app.module.ts` with all required fields from `aidlc-profile.md`.
- ✅ No hardcoded secrets; all PEM/key vars loaded via `process.env`.
- ✅ NestJS module structure: each feature has a `*.module.ts` with controllers/services/repos.
- ✅ kebab-case file names throughout.

### Category: Risk (bugs, races, off-by-one, regex DOS, etc.)

- ⚠️ **Concern**: `login-rate-limit.guard.ts` mutates `attempts` inside `nextRetryAfterSeconds` before the guard decides to throw. This is correct semantics (eviction happens regardless of outcome), but the side-effect-on-read pattern is subtle. Document or refactor.
- ⚠️ **Concern**: `refresh-tokens.repo.ts:rotate` uses Prisma's `$transaction` which defaults to READ COMMITTED isolation. On PostgreSQL, the `findUnique` inside the transaction does NOT implicitly do `SELECT FOR UPDATE` — so a concurrent rotation could in theory both pass the `rotatedAt IS NULL` check and both insert. For ≤ 50 internal users this is acceptable; for production-scale we'd switch to `prisma.$queryRaw` with explicit `FOR UPDATE`. **Recommended**: add a comment and a TODO referencing this.
- ✅ No SQL injection vectors (all queries go through Prisma's parameterized API).
- ✅ No regex DOS (only simple regex in `update-profile.dto.ts` for IANA timezone — bounded).
- ✅ JWT verification properly uses jose's audience/issuer checks (mutual rejection of access vs refresh tokens).
- ✅ Password verification uses argon2's constant-time compare under the hood.

### Category: Maintainability

- ✅ No function over 50 lines (longest is `AuthService.refresh` at ~38 lines).
- ✅ No file over 400 lines (largest is `auth.service.ts` at ~115 lines).
- ✅ No magic numbers — all thresholds named (`MAX_ATTEMPTS`, `WINDOW_MS`, `ACCESS_TOKEN_TTL_S`, etc.).
- ✅ Error context preserved through the `ErrorEnvelopeFilter` (zod errors decoded into human-readable detail).

### Category: Story coverage

- ✅ **US-001** Sign up — primary files written (`auth.controller`, `auth.service.signup`, `signup.dto`, `signup-form.tsx`, `signup/page.tsx`).
- ✅ **US-002** Account setup — `users.controller`, `account-setup-form.tsx`, `auth-guard.tsx` enforces gating.
- ✅ **US-003** Log in — `auth.controller` + service login/refresh paths; FE `sign-in-form.tsx`; silent-refresh interceptor.
- ✅ **US-004** Dashboard — `dashboard/page.tsx` + `use-auth.ts` user fetch.
- ✅ **US-005** Logout — `auth.service.logout` + FE logout mutation with sonner toast.
- ✅ **US-006** Errors — `login-rate-limit.guard`, `error-envelope.filter`, `invalid-credentials`, `form-error.tsx`.
- 🟡 **US-007** A11y audit — implementation present (a11y-aware components), but the actual axe-core scan E2E spec is deferred to Outstanding.
- 🟡 **US-008** Security audit — implementation present, all 4 PBT files cover the core invariants; but DevTools cookie inspection + log-scrape E2E is deferred to Outstanding.

## Concerns summary

| # | Concern | Severity | Required action |
|---|---------|----------|------------------|
| 1 | OpenAPI hand-written spec deferred to `@nestjs/swagger` auto-emit — contract drift risk between FE and BE | Medium | Commit `apps/backend/openapi.yaml` (auto-emit) + `apps/frontend/src/api/schema.ts` (codegen output) once at first build; verify in CI |
| 2 | Refresh-token rotation transaction lacks explicit `SELECT FOR UPDATE` — theoretical race on concurrent rotation | Low (≤ 50 users) | Add code comment + TODO; raise to High if reused on a client engagement at scale |
| 3 | Rate-limit guard side-effects-on-read pattern | Low | Document with a comment |
| 4 | US-007 axe-core E2E + US-008 DevTools cookie/log-scrape E2E deferred per scoping note | Medium | Either fill in (multi-turn) OR compensate at Stage 14 Manual QA with explicit a11y + security manual scenarios |
| 5 | Coverage below NFR-MAINT-001 80% target (intentional per scoping) | Medium | Pod decision — fill in, accept gap, or relax NFR via Pod Override |

**Total Concern items**: 5
**Total Reject items**: 0

## Verdict

- ✅ **Approve with concerns** — 0 Reject findings; 5 Concern items (above the ≤ 2 Concern threshold).

Per the rubric, > 2 Concerns yield a **PROCEED-with-caveats** synthesis verdict rather than clean PROCEED. The pod must explicitly accept the concerns at countersign — or instruct fill-in.

In the Gate #4 verdict block, this row is **⚠️ Concerns (5; PROCEED-with-caveats)**.
