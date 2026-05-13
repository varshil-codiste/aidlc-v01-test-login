# Stack Selection — auth UoW

**Generated**: 2026-05-12T00:22:00Z
**Tier**: Greenfield
**UoW**: `auth`
**Source**: `auth-stack-selection-questions.md` — Q answers: A.1=B (Next.js — recommended, letter is B), A.2=A, A.3=A, B.1=A, B.2=A, B.3=A, B.4=A, F.1=A, F.2=A.

---

## Frontend (Web)

| Choice | Value | Source |
|--------|-------|--------|
| Framework | **Next.js 14+ (App Router)** | A.1=B |
| Language | TypeScript (strict) | implied by ADR-006 + Codiste preset |
| UI library | **Tailwind CSS + shadcn/ui** | A.2=A |
| Server state | **TanStack Query (`@tanstack/react-query`)** | A.3=A |
| Routing | App Router (Next.js built-in) | A.1=B |
| Form handling | React Hook Form + zod resolver | Codiste preset |
| Toast / global notifications | `sonner` (or shadcn's `<Toaster/>`) | Codiste preset |
| Icons | `lucide-react` (Codiste-standard with shadcn) | Codiste preset |
| Test runner | Vitest + React Testing Library | matches B.3 |
| E2E | Playwright | Codiste preset (NFR-TEST-005) |
| Lint / format | ESLint + Prettier (matches B.4) | A.4 inherited |

## Backend (Node.js, TypeScript)

| Choice | Value | Source |
|--------|-------|--------|
| Framework | **NestJS 10+** | B.1=A |
| Language | TypeScript (strict mode) | Stage 9 Q4=A binding |
| ORM | **Prisma 5+** | B.2=A |
| Validation | **zod** (NestJS DI-friendly via `nestjs-zod`) | NFR-SEC-006 implementation choice |
| Password hash | **`argon2`** npm package (Argon2id) | NFR-SEC-001 / BR-A03 |
| JWT | **`jose`** | NFR-SEC-002; preferred over `jsonwebtoken` for first-party JWKS |
| Logger | **`pino`** + `pino-pretty` (dev only) | NFR-OBS-001 |
| Test runner | **Vitest** | B.3=A |
| PBT lib | **`fast-check`** | NFR-TEST-002 / NFR-TEST-003 |
| HTTP-test util | **`supertest`** or NestJS native `INestApplication` test harness | Codiste preset |
| Lint / format | **ESLint + Prettier** | B.4=A |
| Build | `nest build` (uses `swc` for speed) | NestJS default |

## Shared / Cross-stack

| Choice | Value | Source |
|--------|-------|--------|
| Contract format | **OpenAPI 3.1** at `apps/backend/openapi.yaml` (NestJS `@nestjs/swagger` generates from decorators) | F.1=A; ADR-001 |
| FE codegen tool | **`openapi-typescript`** or `orval` (generates a typed client from OpenAPI for TanStack Query) | Codiste preset |
| Cloud target | **Self-hosted / on-prem (docker-compose dev host)** | F.2=A |
| Queue | N/A (Stage 10 declared no LC-002) | NFR Design |
| Vector store | N/A (AI/ML extension opted out) | Stage 4 A4=C |
| Container orchestration | `docker-compose` (dev) — Stage 17 IaC SKIPPED | FR-021 + Stage 7 |
| CI | GitHub Actions (Codiste preset; confirmed at Stage 16) | aidlc-profile.md |

## Project layout (Codiste convention — final paths)

```
login-account-setup/                 # workspace root
├── apps/
│   ├── backend/                     # NestJS app
│   │   ├── src/
│   │   │   ├── auth/                # AuthController, AuthService, dto/, guards/
│   │   │   ├── users/               # UserController, UserService, dto/
│   │   │   ├── jwks/                # JwksController
│   │   │   ├── health/              # HealthController
│   │   │   ├── common/              # middleware, filters, helpers
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── request-id.middleware.ts        (LC-002)
│   │   │   │   │   └── security-headers.middleware.ts  (P-SEC-004)
│   │   │   │   ├── filters/
│   │   │   │   │   └── error-envelope.filter.ts         (LC-012)
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-cookie.guard.ts              (LC-011)
│   │   │   │   ├── pipes/
│   │   │   │   │   └── zod-validation.pipe.ts           (LC-010)
│   │   │   │   ├── rate-limit/
│   │   │   │   │   └── login-rate-limit.ts              (LC-001 + P-SEC-003)
│   │   │   │   ├── errors/
│   │   │   │   │   └── invalid-credentials.ts           (LC-013)
│   │   │   │   ├── logger/
│   │   │   │   │   └── logger.module.ts                 (LC-003)
│   │   │   │   ├── cookies/
│   │   │   │   │   └── auth-cookies.ts                  (LC-004)
│   │   │   │   ├── crypto/
│   │   │   │   │   ├── password-hasher.service.ts       (LC-005)
│   │   │   │   │   └── jwt-signer.service.ts            (LC-006)
│   │   │   │   └── email/
│   │   │   │       └── email-stub.service.ts            (LC-008)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── tests/
│   │   │   ├── unit/                # *.spec.ts
│   │   │   ├── integration/         # *.int-spec.ts (boots Nest + Postgres testcontainer)
│   │   │   └── properties/          # *.prop-spec.ts (fast-check property tests)
│   │   ├── openapi.yaml             # generated by @nestjs/swagger at build
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── eslint.config.js
│   │   └── Dockerfile
│   └── frontend/                    # Next.js app
│       ├── src/
│       │   ├── app/                 # App Router
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx                 # Landing (LandingPage)
│       │   │   ├── signup/page.tsx
│       │   │   ├── account-setup/page.tsx
│       │   │   ├── dashboard/page.tsx
│       │   │   └── not-found.tsx
│       │   ├── components/
│       │   │   ├── brand-panel.tsx
│       │   │   ├── card.tsx
│       │   │   ├── form-input.tsx
│       │   │   ├── form-error.tsx
│       │   │   ├── primary-button.tsx
│       │   │   ├── outlined-button.tsx
│       │   │   ├── brand-logo.tsx
│       │   │   ├── heading.tsx
│       │   │   ├── paragraph.tsx
│       │   │   └── select.tsx
│       │   ├── forms/
│       │   │   ├── sign-in-form.tsx
│       │   │   ├── signup-form.tsx
│       │   │   └── account-setup-form.tsx
│       │   ├── auth/
│       │   │   ├── auth-guard.tsx
│       │   │   ├── use-auth.ts
│       │   │   └── logout-action.ts
│       │   ├── api/
│       │   │   ├── client.ts                 # generated openapi-typescript
│       │   │   └── interceptor.ts            # silent-refresh
│       │   └── theme/
│       │       └── tokens.ts                 # imports from shared/design-tokens.json
│       ├── public/
│       │   └── zone-logo.png
│       ├── playwright/                       # E2E specs
│       ├── vitest.config.ts
│       ├── playwright.config.ts
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── eslint.config.js
│       └── Dockerfile
├── shared/
│   ├── design-tokens.json                    # generated from design/design-tokens.md
│   └── openapi.yaml -> apps/backend/openapi.yaml   # symlink
├── docker-compose.yml
├── docker-compose.ci.yml
├── .env.example
├── .github/workflows/ci.yml
├── scripts/
│   ├── ci.sh
│   └── gen-keys.sh                           # generates RS256 keypair
└── README.md
```

(Final filename casing conforms to NestJS conventions: kebab-case files; PascalCase classes.)

## Conventions Files Loaded

- `.aidlc/aidlc-rule-details/construction/stacks/frontend-conventions.md` — applies for FE
- `.aidlc/aidlc-rule-details/construction/stacks/node-conventions.md` — applies for BE Node
- (Python / Go / Flutter conventions files exist in the rule pack but are NOT loaded — not in scope)

These conventions enforce naming + lint + test conventions during Stage 12 (Code Generation) and Stage 13 (Code Review).

## NFR-driven dependencies (must be in `package.json`)

| Concern | Library | Version | Owning NFR/Pattern |
|---------|---------|---------|---------------------|
| Argon2id | `argon2` | ^0.40 | NFR-SEC-001 / P-SEC-009 |
| JWT + JWKS | `jose` | ^5.x | NFR-SEC-002 / P-SEC-010 |
| Zod validation | `zod`, `nestjs-zod` | ^3.x / ^3.x | NFR-SEC-006 / P-SEC-001 |
| Pino logger | `pino`, `nestjs-pino`, `pino-pretty` (dev) | ^9.x / ^4.x / ^11.x | NFR-OBS-001 / P-OBS-002 |
| Cookie parsing | `cookie-parser` (NestJS default) | ^1.x | NFR-SEC-003 / LC-004 |
| Helmet (sec headers) | `helmet` | ^8.x | NFR-SEC-005 / P-SEC-004 |
| PBT | `fast-check` (devDep) | ^3.x | NFR-TEST-002 / NFR-TEST-003 |
| Prisma | `prisma` (devDep), `@prisma/client` | ^5.x | NFR-PERF-001 + DB |
| Vitest | `vitest`, `vite` (devDep) | ^2.x | NFR-TEST-001..006 |
| Supertest | `supertest` (devDep) | ^7.x | integration tests |
| `tanstack/react-query` (FE) | `@tanstack/react-query` | ^5.x | NFR-OBS — FE state caching |
| `next` (FE) | `next` | ^14.x | NFR-PERF-002 / P-PERF-003 |
| `tailwindcss` (FE) | `tailwindcss` | ^3.4.x | UI styling |
| `shadcn/ui` (FE) | per `shadcn` CLI; uses `radix-ui/*` + class-variance-authority + tailwindcss-animate | — | NFR-A11Y-* (radix a11y) |
| `react-hook-form` (FE) | `react-hook-form`, `@hookform/resolvers` | ^7.x / ^3.x | form state |
| `sonner` (FE) | `sonner` | ^1.x | toasts (FR-015) |
| `lucide-react` (FE) | `lucide-react` | latest | icons |
| `@axe-core/playwright` | `@axe-core/playwright` (devDep) | ^4.x | NFR-A11Y verification in E2E |
| `playwright` (FE/E2E) | `@playwright/test` (devDep) | ^1.x | NFR-TEST-005 |
| `openapi-typescript` | `openapi-typescript` (devDep) | ^7.x | OpenAPI codegen on FE |
| `nestjs/swagger` | `@nestjs/swagger` | ^7.x | OpenAPI generation on BE |
