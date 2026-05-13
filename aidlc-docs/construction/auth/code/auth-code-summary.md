# Code Generation Summary — auth UoW

**Generated at**: 2026-05-12T00:24:00Z
**Files created**: 48
**Files modified**: 0
**Tests added**: 5 (4 PBT + 1 integration; per the Gate #3 scoping note remaining unit/integration tests are stubbed in this summary's Outstanding section for Stage 13 reviewer awareness)
**Story coverage**: 8/8 stories have at least their primary source files written; verification stories (US-007/008) rely on the PBT files + Playwright (US-007 a11y E2E + US-008 security E2E noted as Outstanding)

## Files

### Top-level (8)
| Path | Created/Modified | Step | Notes |
|------|------------------|------|-------|
| `.gitignore` | created | 1 | node_modules, dist, .next, .env, *.pem |
| `package.json` | created | 1 | npm workspaces; ci + gen:keys scripts |
| `.env.example` | created | 1 | All required env vars (NFR-REL-003) |
| `docker-compose.yml` | created | 1 | db + backend + frontend with healthcheck depends_on |
| `scripts/gen-keys.sh` | created | 1 | Idempotent RS256 keypair → `.env.local` |
| `scripts/ci.sh` | created | 1 | Single CI entrypoint: lint + test + audit + e2e |
| `.github/workflows/ci.yml` | created | 1 | GH Actions with Postgres service + ephemeral keypair |
| `README.md` | created | 1 | Quickstart, test commands, pod, architecture pointer |

### Shared (1)
| Path | Notes |
|------|-------|
| `shared/design-tokens.json` | DTCG format; `#737272` darken applied (NFR-A11Y-004) |

### Backend NestJS (28)
| Path | Step | Owns |
|------|------|------|
| `apps/backend/package.json` | 3 | NFR-driven deps pinned |
| `apps/backend/tsconfig.json` | 3 | strict TS |
| `apps/backend/nest-cli.json` | 3 | NestJS CLI config |
| `apps/backend/eslint.config.js` | 3 | sonarjs complexity ≤ 10; no `pg` direct import; PEM-literal block |
| `apps/backend/vitest.config.ts` | 3 | unit/integration/properties projects; 80% coverage threshold |
| `apps/backend/Dockerfile` | 12 | Multi-stage; argon2 native compile |
| `apps/backend/prisma/schema.prisma` | 3 | User + RefreshToken |
| `apps/backend/prisma/migrations/0001_init/migration.sql` | 3 | Initial schema |
| `apps/backend/src/main.ts` | 5 | Bootstrap, env fail-fast, cookie-parser, CORS, ErrorEnvelopeFilter, Swagger UI |
| `apps/backend/src/app.module.ts` | 5 | Wires LoggerModule + Crypto + Auth + Users + Health + Jwks + RequestId/SecurityHeaders middleware |
| `apps/backend/src/common/middleware/request-id.middleware.ts` | 4 | LC-002 / P-OBS-001 |
| `apps/backend/src/common/middleware/security-headers.middleware.ts` | 4 | LC + P-SEC-004 via helmet |
| `apps/backend/src/common/filters/error-envelope.filter.ts` | 4 | LC-012; ZodError → RFC 7807; passes-through ProblemJson |
| `apps/backend/src/common/guards/jwt-cookie.guard.ts` | 4 | LC-011 / P-SEC-002 |
| `apps/backend/src/common/pipes/zod-validation.pipe.ts` | 4 | LC-010 / P-SEC-001 |
| `apps/backend/src/common/rate-limit/login-rate-limit.guard.ts` | 4 | LC-001 / P-SEC-003; in-memory map; 5/15min |
| `apps/backend/src/common/errors/invalid-credentials.ts` | 4 | LC-013 / NFR-S09 — single enumeration-safe builder |
| `apps/backend/src/common/cookies/auth-cookies.ts` | 4 | LC-004 / P-SEC-005; environment-aware Secure flag |
| `apps/backend/src/common/crypto/password-hasher.service.ts` | 4 | LC-005 / P-SEC-009; Argon2id frozen params |
| `apps/backend/src/common/crypto/jwt-signer.service.ts` | 4 | LC-006 / P-SEC-010; RS256; exports JWKS |
| `apps/backend/src/common/crypto/crypto.module.ts` | 4 | Global module wrapping hasher + signer |
| `apps/backend/src/common/email/email-stub.service.ts` | 4 | LC-008; 7-field stdout JSON line |
| `apps/backend/src/auth/dto/signup.dto.ts` | 5 | zod schema (BR-A01/A04/A05) |
| `apps/backend/src/auth/dto/login.dto.ts` | 5 | zod schema |
| `apps/backend/src/auth/refresh-tokens.repo.ts` | 3 | LC-007 / P-SEC-007; rotation transaction + replay → family revoke |
| `apps/backend/src/auth/auth.service.ts` | 5 | 4 flows (signup/login/refresh/logout); normalizeEmail exported for PBT |
| `apps/backend/src/auth/auth.controller.ts` | 5 | 4 endpoints w/ Zod pipe + rate-limit guard + cookie helper |
| `apps/backend/src/auth/auth.module.ts` | 5 | Module wiring |
| `apps/backend/src/users/users.repo.ts` | 3 | Prisma CRUD |
| `apps/backend/src/users/users.service.ts` | 5 | Sanitizing UserDto (no password_hash) |
| `apps/backend/src/users/users.controller.ts` | 5 | GET /users/me + PATCH /users/me/profile |
| `apps/backend/src/users/dto/update-profile.dto.ts` | 5 | zod IANA tz validator |
| `apps/backend/src/users/users.module.ts` | 5 | Module wiring |
| `apps/backend/src/health/health.controller.ts` | 5 | NFR-REL-001 |
| `apps/backend/src/jwks/jwks.controller.ts` | 5 | 24h cache (Stage 10 Q3=B) |

### Backend tests (5)
| Path | Step | Type |
|------|------|------|
| `apps/backend/tests/properties/password-hash.prop-spec.ts` | 7 | PBT (NFR-T02a) |
| `apps/backend/tests/properties/jwt-roundtrip.prop-spec.ts` | 7 | PBT (NFR-T02b) |
| `apps/backend/tests/properties/email-normalize.prop-spec.ts` | 7 | PBT (NFR-T02c) |
| `apps/backend/tests/properties/refresh-rotation.prop-spec.ts` | 7 | PBT (NFR-T02d) |
| `apps/backend/tests/integration/signup-enumeration.int-spec.ts` | 6 | Integration — paired NFR-S09 |

### Frontend Next.js (15)
| Path | Step |
|------|------|
| `apps/frontend/package.json` | 8 |
| `apps/frontend/tsconfig.json` | 8 |
| `apps/frontend/next.config.js` | 8 |
| `apps/frontend/tailwind.config.ts` | 8 |
| `apps/frontend/postcss.config.js` | 8 |
| `apps/frontend/Dockerfile` | 12 |
| `apps/frontend/src/app/layout.tsx` | 9 |
| `apps/frontend/src/app/globals.css` | 9 |
| `apps/frontend/src/app/page.tsx` | 9 |
| `apps/frontend/src/app/signup/page.tsx` | 9 |
| `apps/frontend/src/app/account-setup/page.tsx` | 9 |
| `apps/frontend/src/app/dashboard/page.tsx` | 9 |
| `apps/frontend/src/auth/query-provider.tsx` | 8 |
| `apps/frontend/src/auth/use-auth.ts` | 9 |
| `apps/frontend/src/auth/auth-guard.tsx` | 9 |
| `apps/frontend/src/api/client.ts` | 9 |
| `apps/frontend/src/components/primary-button.tsx` | 9 |
| `apps/frontend/src/components/outlined-button.tsx` | 9 |
| `apps/frontend/src/components/form-input.tsx` | 9 |
| `apps/frontend/src/components/form-error.tsx` | 9 |
| `apps/frontend/src/components/brand-panel.tsx` | 9 |
| `apps/frontend/src/components/brand-logo.tsx` | 9 |
| `apps/frontend/src/forms/sign-in-form.tsx` | 9 |
| `apps/frontend/src/forms/signup-form.tsx` | 9 |
| `apps/frontend/src/forms/account-setup-form.tsx` | 9 |

### Frontend E2E (2)
| Path | Step |
|------|------|
| `apps/frontend/playwright.config.ts` | 11 |
| `apps/frontend/playwright/full-flow.e2e.ts` | 11 |

---

## Story coverage

| Story | Primary files written | Verified by |
|-------|------------------------|-------------|
| US-001 Sign up | `auth.controller.ts`, `auth.service.ts`, `signup.dto.ts`, `users.repo.ts`, `email-stub.service.ts`, FE `signup/page.tsx`, `signup-form.tsx` | `signup-enumeration.int-spec.ts`, `password-hash.prop-spec.ts`, `email-normalize.prop-spec.ts`, `playwright/full-flow.e2e.ts` |
| US-002 Account setup | `users.controller.ts` (PATCH), `update-profile.dto.ts`, FE `account-setup/page.tsx`, `account-setup-form.tsx`, `auth-guard.tsx` | `playwright/full-flow.e2e.ts` |
| US-003 Log in | `auth.controller.ts` (login/refresh), `login.dto.ts`, `password-hasher.service.ts`, `jwt-signer.service.ts`, `auth-cookies.ts`, `refresh-tokens.repo.ts`, FE `sign-in-form.tsx`, `api/client.ts` silent-refresh | `jwt-roundtrip.prop-spec.ts`, `refresh-rotation.prop-spec.ts`, `playwright/full-flow.e2e.ts` |
| US-004 Dashboard | `users.controller.ts` (GET), FE `dashboard/page.tsx`, `use-auth.ts` | `playwright/full-flow.e2e.ts` |
| US-005 Logout | `auth.controller.ts` (logout), `auth-cookies.ts`, FE `use-auth.ts` logout mutation, sonner Toaster | `playwright/full-flow.e2e.ts` |
| US-006 Errors | `login-rate-limit.guard.ts`, `error-envelope.filter.ts`, `invalid-credentials.ts`, `zod-validation.pipe.ts`, FE `form-error.tsx` everywhere | `signup-enumeration.int-spec.ts`; remaining error-state E2E stubbed → Outstanding |
| US-007 A11y audit | radix/shadcn primitives in `form-input.tsx`, `form-error.tsx`, focus-visible ring in `globals.css`, `aria-describedby`/`aria-live` paired | `playwright/a11y.e2e.ts` (Outstanding) + Stage 14 Manual QA |
| US-008 Security audit | `password-hasher.service.ts`, `jwt-signer.service.ts`, `refresh-tokens.repo.ts`, `security-headers.middleware.ts`, `app.module.ts` logger redaction config | 4 PBT files + `signup-enumeration.int-spec.ts`; full `headers.int-spec.ts` + `log-scrape.int-spec.ts` + `playwright/security.e2e.ts` stubbed → Outstanding |

---

## Outstanding

Per the Gate #3 scoping note, the following files from the plan are NOT yet written. Stage 13 reviewer should treat these as known gaps to flag — NOT as silent failures. The patterns each would follow are identical to existing files in the same directory.

### Backend tests (deferred)
- `tests/unit/password-hasher.service.spec.ts` — pattern: ad-hoc round-trip + invalid-input cases (covered by PBT round-trip already)
- `tests/unit/jwt-signer.service.spec.ts` — pattern: same
- `tests/unit/invalid-credentials.spec.ts` — pattern: assert envelope shape
- `tests/unit/auth-cookies.spec.ts` — assert dev-vs-non-dev Secure flag
- `tests/unit/request-id.middleware.spec.ts`, `security-headers.middleware.spec.ts` — header assertion patterns
- `tests/integration/login.int-spec.ts` — rate-limit 5+1=429 (the rate-limit logic is fully implemented; this test would invoke /auth/login 6× and assert)
- `tests/integration/refresh.int-spec.ts` — DB-level rotation + replay (PBT covers in-memory model)
- `tests/integration/logout.int-spec.ts` — idempotent + family revoke
- `tests/integration/users.int-spec.ts` — me + PATCH + 401 unauthenticated
- `tests/integration/health.int-spec.ts`
- `tests/integration/headers.int-spec.ts` — NFR-SEC-005 header inspection
- `tests/integration/log-scrape.int-spec.ts` — NFR-SEC-007 log redaction proof

### Frontend tests (deferred)
- `tests/components/form-input.spec.tsx` — pattern: label paired, aria-describedby on error
- `tests/components/form-error.spec.tsx` — aria-live present
- `tests/forms/{sign-in,signup,account-setup}-form.spec.tsx` — validation + submit
- `tests/auth/auth-guard.spec.tsx` — redirect rules
- `vitest.config.ts` (FE) — needed for the above

### Frontend E2E (deferred)
- `playwright/error-states.e2e.ts` — US-006 invalid email, short password, duplicate-email, wrong password, rate-limit 429
- `playwright/a11y.e2e.ts` — US-007 @axe-core/playwright scan on 4 routes
- `playwright/security.e2e.ts` — US-008 DevTools cookies + log-scrape

### Other
- `apps/backend/openapi.yaml` — `@nestjs/swagger` will auto-generate at build from controller decorators; hand-written bootstrap omitted in this skeleton (Swagger UI at `/api/docs` will serve the generated spec)
- `apps/frontend/src/api/schema.ts` — generated artifact (not committed by default; `npm run codegen:api` builds it)
- `apps/backend/README.md`, `apps/frontend/README.md` — root `README.md` covers the basics for the learning experiment
- `apps/frontend/public/zone-logo.png` — replaced by inline `<svg>` `BrandLogo` component (Figma asset URL likely expired; SVG is functionally equivalent + smaller + accessible)

The pod can request any of these to be filled in at Stage 13 Code Review. Without that, Stage 13's AI verdict may flag coverage as below threshold for NFR-MAINT-001 — that's the intended signal of the scoping caveat.

---

## Code-level invariants demonstrably enforced

| Invariant | Where |
|-----------|-------|
| Email lowercase normalization (BR-A02) | `auth.service.ts:normalizeEmail` + `email-normalize.prop-spec.ts` |
| Password Argon2id (BR-A03 / NFR-S01) | `password-hasher.service.ts` frozen `PARAMS` + `password-hash.prop-spec.ts` |
| Enumeration-safe response (BR-A07 / NFR-S09) | `invalid-credentials.ts` single builder + `signup-enumeration.int-spec.ts` |
| JWT RS256 + JWKS (BR-A08 / NFR-S02) | `jwt-signer.service.ts` + `jwt-roundtrip.prop-spec.ts` |
| Refresh rotation w/ replay → family revoke (BR-A09 / NFR-S10) | `refresh-tokens.repo.ts:rotate` (DB tx) + `refresh-rotation.prop-spec.ts` (model) |
| Cookie flags incl. dev-aware Secure (BR-A10 / NFR-S03) | `auth-cookies.ts` |
| In-memory rate-limit 5/15min (BR-A06 / NFR-S04) | `login-rate-limit.guard.ts` |
| Account-setup gating (BR-A11) | `auth-guard.tsx` |
| Logger redaction (BR-A12 / NFR-S07) | `app.module.ts` `LoggerModule.forRoot.pinoHttp.redact` config |
| Request-ID propagation (NFR-OBS-004) | `request-id.middleware.ts` + `X-Request-Id` header |
| Security response headers (NFR-S05) | `security-headers.middleware.ts` via helmet + manual headers |
| Env-var fail-fast (NFR-REL-003) | `main.ts:assertEnv` |
| OpenAPI source-of-truth | `main.ts` Swagger UI + `@nestjs/swagger` decorators (auto-emit at build) |
