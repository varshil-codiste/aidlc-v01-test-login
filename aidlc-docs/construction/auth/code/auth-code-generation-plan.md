# Code Generation Plan — auth UoW

**Tier**: Greenfield
**Stacks in scope**: Frontend (Web, Next.js) + Backend (Node.js, NestJS) + DB (Postgres 16)
**Stories implemented**: US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008 (all 8)
**Generated at**: 2026-05-12T00:23:00Z

## Code Location

- **Workspace root**: `/home/user/Documents/Project/aidlc-v01-test-login`
- **Layout**: Greenfield single-UoW monorepo at workspace root → `apps/backend/` + `apps/frontend/` + `shared/` + `scripts/` + top-level `docker-compose.yml`, `.env.example`, `.github/`, `README.md`
- **NEVER write application code under `aidlc-docs/`** — that directory is for AI-DLC artifacts only

## Skills planned for Part 2 invocation

| Skill | Purpose |
|-------|---------|
| `nestjs-conventions` | Enforces NestJS module/controller/service/dto structure on BE files |
| `react-best-practices` | Enforces Next.js + React + a11y + `data-testid` conventions on FE files |
| `api-contract-designer` | Authors `apps/backend/openapi.yaml` and configures `openapi-typescript` codegen on FE |
| `property-based-test-generator` | Generates the four NFR-T02 a–d property tests using `fast-check` |

Each skill invocation will be logged per `core-workflow.md` § Skill Invocation (two audit entries: pre + post).

---

## Steps

### Step 1: Project Structure Setup (greenfield)

- [ ] Initialize monorepo at workspace root
- [ ] Create top-level `package.json` with workspaces `["apps/*"]`
- [ ] Create `apps/backend/` and `apps/frontend/` directories
- [ ] Create top-level `docker-compose.yml` (services: `db`, `backend`, `frontend`)
- [ ] Create top-level `docker-compose.ci.yml` (used in CI)
- [ ] Create top-level `.env.example` with: `DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `FE_ORIGIN`, `APP_ENV`, `LOG_LEVEL`, `PORT`
- [ ] Create `.gitignore` (node_modules / .next / dist / .env / *.log)
- [ ] Create top-level `README.md` (quickstart + architecture pointer to `aidlc-docs/`)
- [ ] Create `scripts/gen-keys.sh` (RS256 keypair via openssl → writes to `.env.local`)
- [ ] Create `scripts/ci.sh` (single entry-point invoked by GH Actions)
- [ ] Create `.github/workflows/ci.yml` (matrix: lint + test + e2e + audit)

### Step 2: Shared Contracts — OpenAPI 3.1

- [ ] Author `apps/backend/openapi.yaml` (BE source-of-truth; will be auto-generated from NestJS `@nestjs/swagger` decorators at build, but bootstrap with a hand-written version)
  - 8 paths: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me`, `PATCH /users/me/profile`, `GET /health`, `GET /.well-known/jwks.json`
  - Schemas: `SignupRequest`, `LoginRequest`, `UpdateProfileRequest`, `UserDto`, `ProblemJsonError`, `Jwks`
  - Security: cookie auth scheme + `unauthenticated` for /health and /.well-known/*
  - Error envelope: RFC 7807 with `request_id` extension
- [ ] Symlink at `shared/openapi.yaml -> apps/backend/openapi.yaml`
- [ ] FE codegen config: `apps/frontend/openapi-typescript.config.ts` (generates `src/api/schema.ts`)

### Step 3: Backend — Domain & Persistence (Prisma)

- [ ] `apps/backend/package.json` with all NFR-driven deps from `auth-stack-selection.md`
- [ ] `apps/backend/tsconfig.json` (strict TS, target ES2022)
- [ ] `apps/backend/nest-cli.json`
- [ ] `apps/backend/eslint.config.js` (TypeScript + sonarjs for NFR-MAINT-002 + import rules)
- [ ] `apps/backend/prisma/schema.prisma` — `User`, `RefreshToken` per `domain-entities.md`
- [ ] `apps/backend/prisma/migrations/0001_init/migration.sql` — initial schema
- [ ] `apps/backend/src/users/users.module.ts`, `users.service.ts`, `users.repo.ts` (Prisma-backed)
- [ ] `apps/backend/src/auth/refresh-tokens.repo.ts` (Prisma-backed; rotation tx logic)
- [ ] Unit tests:
  - `apps/backend/tests/unit/users.service.spec.ts`
  - `apps/backend/tests/unit/refresh-tokens.repo.spec.ts`

### Step 4: Backend — Common (middleware / pipes / filters / guards / utilities)

- [ ] `apps/backend/src/common/middleware/request-id.middleware.ts` (LC-002 / P-OBS-001)
- [ ] `apps/backend/src/common/middleware/security-headers.middleware.ts` (LC + P-SEC-004; wraps `helmet`)
- [ ] `apps/backend/src/common/filters/error-envelope.filter.ts` (LC-012; NestJS `@Catch()` filter)
- [ ] `apps/backend/src/common/guards/jwt-cookie.guard.ts` (LC-011 / P-SEC-002)
- [ ] `apps/backend/src/common/pipes/zod-validation.pipe.ts` (LC-010 / P-SEC-001)
- [ ] `apps/backend/src/common/rate-limit/login-rate-limit.guard.ts` (LC-001 + P-SEC-003)
- [ ] `apps/backend/src/common/errors/invalid-credentials.ts` (LC-013 / P-SEC-006; RFC 7807 builder)
- [ ] `apps/backend/src/common/logger/logger.module.ts` (LC-003; wraps `nestjs-pino` with redaction config)
- [ ] `apps/backend/src/common/cookies/auth-cookies.ts` (LC-004 / P-SEC-005)
- [ ] `apps/backend/src/common/crypto/password-hasher.service.ts` (LC-005 / P-SEC-009; Argon2id frozen params)
- [ ] `apps/backend/src/common/crypto/jwt-signer.service.ts` (LC-006 / P-SEC-010; jose; loads keys at bootstrap)
- [ ] `apps/backend/src/common/email/email-stub.service.ts` (LC-008; pino info call with 7-field shape)
- [ ] Unit tests for each:
  - `password-hasher.service.spec.ts`
  - `jwt-signer.service.spec.ts`
  - `invalid-credentials.spec.ts`
  - `auth-cookies.spec.ts`
  - `request-id.middleware.spec.ts`
  - `security-headers.middleware.spec.ts`

### Step 5: Backend — Auth & User Controllers / Services

- [ ] `apps/backend/src/auth/dto/signup.dto.ts` (zod schema)
- [ ] `apps/backend/src/auth/dto/login.dto.ts` (zod schema)
- [ ] `apps/backend/src/auth/auth.controller.ts` — 4 endpoints (signup, login, refresh, logout)
- [ ] `apps/backend/src/auth/auth.service.ts` — 4 flows per `business-logic-model.md`
- [ ] `apps/backend/src/users/dto/update-profile.dto.ts` (zod)
- [ ] `apps/backend/src/users/users.controller.ts` — 2 endpoints (`GET /users/me`, `PATCH /users/me/profile`)
- [ ] `apps/backend/src/health/health.controller.ts`
- [ ] `apps/backend/src/jwks/jwks.controller.ts`
- [ ] `apps/backend/src/app.module.ts` (wires all modules, middleware, guards, filters)
- [ ] `apps/backend/src/main.ts` (bootstrap; loads env; instantiates pino; registers OpenAPI via `@nestjs/swagger`)
- [ ] Unit tests for each service:
  - `auth.service.spec.ts`
  - `users.service.spec.ts`

### Step 6: Backend — Integration tests

- [ ] `apps/backend/tests/integration/signup.int-spec.ts` — happy + duplicate-email (NFR-S09 paired) + invalid-email + short-password
- [ ] `apps/backend/tests/integration/login.int-spec.ts` — happy + wrong-password (NFR-S09 paired body assertion) + rate-limit (5+1=429)
- [ ] `apps/backend/tests/integration/refresh.int-spec.ts` — happy rotation + replay revokes family + expired
- [ ] `apps/backend/tests/integration/logout.int-spec.ts` — happy + idempotent (no cookie → 204)
- [ ] `apps/backend/tests/integration/users.int-spec.ts` — /users/me happy + unauthenticated + PATCH happy + invalid timezone
- [ ] `apps/backend/tests/integration/health.int-spec.ts`
- [ ] `apps/backend/tests/integration/headers.int-spec.ts` — assert NFR-SEC-005 headers on every response
- [ ] `apps/backend/tests/integration/log-scrape.int-spec.ts` — assert no plaintext password / JWT in logs (NFR-S07)
- [ ] `apps/backend/tests/integration/helpers/postgres-testcontainer.ts` — testcontainer harness
- [ ] `apps/backend/vitest.config.ts` — separate `test:unit` / `test:integration` projects

### Step 7: Backend — Property-Based Tests (PBT extension)

Skill `property-based-test-generator` runs here. Produces:

- [ ] `apps/backend/tests/properties/password-hash.prop-spec.ts` (NFR-T02a) — `verify(hash(p)) === true` ∀ p length ≥ 12
- [ ] `apps/backend/tests/properties/jwt-roundtrip.prop-spec.ts` (NFR-T02b) — `verify(sign(claims)) === claims` modulo JOSE-added fields
- [ ] `apps/backend/tests/properties/email-normalize.prop-spec.ts` (NFR-T02c) — `normalize(normalize(e)) === normalize(e)`
- [ ] `apps/backend/tests/properties/refresh-rotation.prop-spec.ts` (NFR-T02d) — N rotations → N+1 distinct tokens; replay revokes family

### Step 8: Frontend — Setup

- [ ] `apps/frontend/package.json` with all NFR-driven deps
- [ ] `apps/frontend/tsconfig.json` (strict)
- [ ] `apps/frontend/next.config.js`
- [ ] `apps/frontend/tailwind.config.ts` — pulls tokens from `shared/design-tokens.json`
- [ ] `apps/frontend/postcss.config.js`
- [ ] `apps/frontend/eslint.config.js` (Next.js + a11y + sonarjs)
- [ ] `apps/frontend/components.json` (shadcn/ui config)
- [ ] `apps/frontend/openapi-typescript.config.ts` — points at `../backend/openapi.yaml`
- [ ] Generate `apps/frontend/src/api/schema.ts` (codegen output committed for repeatability)
- [ ] `shared/design-tokens.json` — derived from `aidlc-docs/inception/design/design-tokens.md` (with `#737272` darken applied per Stage 8 Q1)
- [ ] `apps/frontend/public/zone-logo.png` — copied from Figma asset URL (fetched fresh; the original 7-day Figma URL may have expired)

### Step 9: Frontend — Components & Pages (App Router)

- [ ] `apps/frontend/src/app/layout.tsx` — providers (Theme, Toaster, QueryClient), global font (Inter fallback per Stage 8 Q5)
- [ ] `apps/frontend/src/app/page.tsx` — LandingPage (50/50 split per Figma)
- [ ] `apps/frontend/src/app/signup/page.tsx` — SignupPage
- [ ] `apps/frontend/src/app/account-setup/page.tsx` — AccountSetupPage (server-component → AuthGuard wraps)
- [ ] `apps/frontend/src/app/dashboard/page.tsx` — DashboardPage (AuthGuard wraps)
- [ ] `apps/frontend/src/app/not-found.tsx`
- [ ] `apps/frontend/src/components/brand-panel.tsx`
- [ ] `apps/frontend/src/components/card.tsx`
- [ ] `apps/frontend/src/components/form-input.tsx` — label paired, `aria-describedby` on error
- [ ] `apps/frontend/src/components/form-error.tsx` — `aria-live="polite"`, icon + text
- [ ] `apps/frontend/src/components/primary-button.tsx` (orange pill)
- [ ] `apps/frontend/src/components/outlined-button.tsx` (white-border pill)
- [ ] `apps/frontend/src/components/brand-logo.tsx`
- [ ] `apps/frontend/src/components/heading.tsx`
- [ ] `apps/frontend/src/components/paragraph.tsx`
- [ ] `apps/frontend/src/components/select.tsx`
- [ ] `apps/frontend/src/forms/sign-in-form.tsx`
- [ ] `apps/frontend/src/forms/signup-form.tsx`
- [ ] `apps/frontend/src/forms/account-setup-form.tsx`
- [ ] `apps/frontend/src/auth/auth-guard.tsx`
- [ ] `apps/frontend/src/auth/use-auth.ts`
- [ ] `apps/frontend/src/auth/logout-action.ts`
- [ ] `apps/frontend/src/api/client.ts` — generated typed client + `withSilentRefresh` interceptor
- [ ] `apps/frontend/src/theme/tokens.ts` — re-export from `shared/design-tokens.json`

Every interactive element gets a `data-testid` per the catalog in `frontend-components.md`.

### Step 10: Frontend — Tests

- [ ] `apps/frontend/tests/components/form-input.spec.tsx` — label paired, aria-describedby on error
- [ ] `apps/frontend/tests/components/form-error.spec.tsx` — aria-live present, icon + text
- [ ] `apps/frontend/tests/forms/signup-form.spec.tsx` — validation + submit
- [ ] `apps/frontend/tests/forms/sign-in-form.spec.tsx`
- [ ] `apps/frontend/tests/auth/auth-guard.spec.tsx`
- [ ] `apps/frontend/vitest.config.ts`

### Step 11: Frontend — E2E (Playwright)

- [ ] `apps/frontend/playwright.config.ts` (Chromium; 1440×900 + 375×667 viewports)
- [ ] `apps/frontend/playwright/full-flow.e2e.ts` — Landing → Sign Up → Account Setup → Dashboard → Logout (US-001 to US-005 happy path)
- [ ] `apps/frontend/playwright/error-states.e2e.ts` — invalid email, short password, duplicate-email, wrong password, rate-limit 429 (US-006)
- [ ] `apps/frontend/playwright/a11y.e2e.ts` — axe-core scan on Landing, Signup, AccountSetup, Dashboard (US-007)
- [ ] `apps/frontend/playwright/security.e2e.ts` — DevTools cookies check (HttpOnly/Secure/SameSite flags); log-scrape (US-008)

### Step 12: Cross-Stack Wire-up

- [ ] Confirm `apps/backend/openapi.yaml` schemas match `apps/frontend/src/api/schema.ts` (regenerate on every BE change in CI)
- [ ] `apps/backend/Dockerfile` (multi-stage; node:20-alpine; `prisma generate` + `nest build`)
- [ ] `apps/frontend/Dockerfile` (multi-stage; node:20-alpine; `next build`; production `next start`)
- [ ] `docker-compose.yml` wires `db → backend → frontend` with healthcheck-based depends_on
- [ ] `.env.example` lists every env var required (NFR-REL-003)

### Step 13: Documentation

- [ ] Top-level `README.md` — quickstart (clone → `bash scripts/gen-keys.sh` → `docker compose up`); env vars; URLs
- [ ] `apps/backend/README.md` — how to migrate, regenerate prisma client, run tests
- [ ] `apps/frontend/README.md` — how to run dev, codegen, tests, E2E
- [ ] OpenAPI viewer: `apps/backend/src/main.ts` enables `/api/docs` Swagger UI in non-prod

### Step 14: Summary & Story Traceability

- [ ] `aidlc-docs/construction/auth/code/auth-code-summary.md` — file-by-file table (created / modified / step / lines)
- [ ] Story coverage map updated

---

## Story Traceability

| Story | Primary BE files | Primary FE files | Test files |
|-------|------------------|-------------------|-------------|
| US-001 Sign up | `auth.controller.ts`, `auth.service.ts` (signup), `signup.dto.ts`, `users.repo.ts`, `email-stub.service.ts` | `app/signup/page.tsx`, `forms/signup-form.tsx`, `components/form-input.tsx`, `components/form-error.tsx` | `signup.int-spec.ts`, `password-hash.prop-spec.ts`, `email-normalize.prop-spec.ts`, `playwright/full-flow.e2e.ts` |
| US-002 Account setup | `users.controller.ts` (PATCH), `users.service.ts`, `update-profile.dto.ts` | `app/account-setup/page.tsx`, `forms/account-setup-form.tsx`, `components/select.tsx`, `auth/auth-guard.tsx` | `users.int-spec.ts`, `playwright/full-flow.e2e.ts` |
| US-003 Log in | `auth.controller.ts`, `auth.service.ts` (login/refresh), `login.dto.ts`, `password-hasher.service.ts`, `jwt-signer.service.ts`, `auth-cookies.ts`, `refresh-tokens.repo.ts` | `app/page.tsx` (Landing right side), `forms/sign-in-form.tsx`, `api/client.ts` (silent refresh) | `login.int-spec.ts`, `refresh.int-spec.ts`, `jwt-roundtrip.prop-spec.ts`, `refresh-rotation.prop-spec.ts` |
| US-004 Dashboard | `users.controller.ts` (GET) | `app/dashboard/page.tsx`, `auth/use-auth.ts`, `auth/auth-guard.tsx` | `users.int-spec.ts`, `auth-guard.spec.tsx`, `playwright/full-flow.e2e.ts` |
| US-005 Logout | `auth.controller.ts` (logout), `auth.service.ts` (logout) | `auth/logout-action.ts`, `components/toast` (sonner) | `logout.int-spec.ts`, `playwright/full-flow.e2e.ts` |
| US-006 Errors | `login-rate-limit.guard.ts`, `error-envelope.filter.ts`, `invalid-credentials.ts`, `zod-validation.pipe.ts` | `components/form-error.tsx`, error state across all forms | `login.int-spec.ts` (rate-limit), `signup.int-spec.ts` (paired), `playwright/error-states.e2e.ts` |
| US-007 A11y audit | (validation comes from Stage 14 manual + axe scans) | (every component) | `playwright/a11y.e2e.ts` (@axe-core/playwright) |
| US-008 Security audit | `password-hasher.service.ts`, `jwt-signer.service.ts`, `refresh-tokens.repo.ts`, `security-headers.middleware.ts`, `logger.module.ts` | (DevTools cookie check via Playwright) | All 4 PBT files, `headers.int-spec.ts`, `log-scrape.int-spec.ts`, `playwright/security.e2e.ts` |

---

## Dependencies

- **Upstream UoWs**: none (only UoW in this project)
- **External services**: none in v1 (no SMTP / OAuth / Sentry / etc.)
- **Env vars required**: `DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `FE_ORIGIN`, `APP_ENV` (required); `LOG_LEVEL`, `PORT` (optional, defaulted)

---

## Estimated File Count

| Category | Count |
|----------|-------|
| Source files — BE | ≈ 35 |
| Source files — FE | ≈ 28 |
| Source files — Shared / scripts / config | ≈ 14 |
| Test files (unit) | ≈ 12 |
| Test files (integration) | ≈ 8 |
| Test files (PBT) | 4 |
| Test files (E2E) | 4 |
| Docs (READMEs) | 3 |
| **Total** | **≈ 108 files** |

> **Scoping note for the learning experiment**: writing 108 files inline in a single chat turn would be impractical and burn context. For Part 2, the AI will produce a **representative high-fidelity skeleton** — every NFR-driving file (auth flow end-to-end, all 4 PBT specs, key middleware/guards/filters, the 4 main FE pages, docker-compose, OpenAPI, README, scripts, CI workflow) — and stub the most repetitive boilerplate (e.g., per-component tests that follow an identical pattern). The story-coverage table above will be honored: every story has at least its primary source files generated. The pod can request additional fill-in at Stage 13 Code Review if needed.

---

## Open Risks for Gate #3 review

1. **Scoping note above** — Pod accepts that "representative skeleton" is the intended Part 2 output for this learning experiment. Full 108-file output is reachable but would require multiple sequential turns.
2. **Figma asset URL expired** — the original 7-day asset URL from Stage 2 may have expired (current date 2026-05-12 vs original 2026-05-12; OK if within 7 days). If expired, AI will use a placeholder `zone-logo.png` and flag for designer follow-up.
3. **Argon2 native binding** — `argon2` npm package compiles native binaries; the Dockerfile must include build-essentials in the build stage (handled in the plan).
4. **RS256 keypair generation** — `scripts/gen-keys.sh` is a side-effect script. The AI will write the script + document it in README; the pod must run it once per dev environment.
5. **Lint / test failures during generation** — per the rule, AI must run tests at each step and fix before marking `[x]`. If any step's tests fail and the AI cannot resolve in-stage, it will pause and ask the pod for direction (will surface in `auth-code-summary.md` § Outstanding).
6. **PBT generation timing** — `fast-check` properties may run for 100+ iterations; CI will time-box at 30s per property file.
