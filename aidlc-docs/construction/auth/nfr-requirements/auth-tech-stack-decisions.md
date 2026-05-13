# Tech Stack Decisions (constraints) — auth UoW

**Generated**: 2026-05-12T00:17:00Z
**Purpose**: Capture NFR-implied constraints that narrow Stage 11's framework menu. Stage 11 makes the actual framework choice.

---

## Constraints implied by NFRs

| NFR | Constraint on tech-stack choice |
|-----|----------------------------------|
| NFR-PERF-001 (p95 ≤ 200 ms) | Avoid frameworks with cold-start > 100 ms in container env (rules out heavy serverless cold starts; matches all in-process Node / Python / Go choices at ≤ 50 users) |
| NFR-PERF-002 (Lighthouse ≥ 90) | FE must be code-split + SSR-capable; rules out pure CSR with huge bundles |
| NFR-SEC-001 (Argon2id) | BE framework must have a battle-tested Argon2id binding: `argon2` (Node), `argon2-cffi` (Python), `golang.org/x/crypto/argon2` (Go) — all available |
| NFR-SEC-002 (RS256) | JWT library with RS256 + JWKS: `jose` / `jsonwebtoken` (Node), `pyjwt` / `jose` (Python), `golang-jwt` (Go) — all available |
| NFR-SEC-008 (deps clean) | Choose libraries with active CVE remediation; flag any deprecated transitive deps at Stage 11 |
| NFR-OBS-001 (JSON structured logs) | Logger: `pino` (Node), `structlog` (Python), `log/slog` (Go) — all support JSON natively |
| NFR-TEST-002 (PBT — extension opted-in) | PBT framework MUST exist for chosen BE language: `fast-check` (TS/Node) ✓, `hypothesis` (Python) ✓, `gopter`/`testing/quick` (Go) ✓ |
| NFR-TEST-005 (E2E Playwright) | FE framework should be Playwright-compatible (effectively all modern web frameworks are) |
| NFR-A11Y-001..008 (WCAG 2.2 AA — extension opted-in) | FE component lib should ship a11y primitives: `shadcn/ui` (radix-ui under the hood — strong a11y) ✓; Codiste preset suggests this |

## Pre-narrowed choices (from Stage 9 Q4 = A)

| Layer | Decision | Rationale |
|-------|----------|-----------|
| **Backend language** | **TypeScript / Node.js** (Stage 9 Q4=A) | Codiste preset first choice; richest FE↔BE shared-type story; rich PBT (fast-check) and JWT (jose) ecosystems; Argon2id binding (`argon2`) is best-in-class |

## Open choices (decided at Stage 11)

| Slot | Codiste preset | Alternatives | Notes |
|------|----------------|--------------|-------|
| **BE framework** | NestJS | Express, Fastify, Hono | NestJS gives DI + middleware contracts that closely match `application-design/services.md`; Express is simplest; Fastify is fastest |
| **BE ORM** | Prisma | Drizzle, TypeORM, Knex | Prisma matches Codiste preset; integrates well with the OpenAPI codegen workflow |
| **BE logger** | pino | Winston, Bunyan | Pino is Codiste preset; native JSON + low overhead |
| **BE test runner** | Vitest | Jest | Codiste preset; Vitest faster + supports PBT cleanly |
| **PBT lib** | fast-check | — | Codiste preset for TS/Node |
| **Schema validator** | zod | yup, class-validator | zod composes nicely with Prisma + OpenAPI; class-validator is NestJS-native |
| **FE framework** | Next.js (App Router) | Vite + React, Remix | Next.js gives SSR + code-split (NFR-PERF-002 friendly); App Router enables route-level a11y via Layout |
| **FE UI primitives** | Tailwind + shadcn/ui | MUI, Mantine | shadcn/ui uses radix-ui (strong a11y baseline); Tailwind tokens map cleanly to `design-tokens.md` |
| **FE server state** | TanStack Query | SWR, RTK Query | Codiste preset; supports `useAuth` hook pattern from `application-design/services.md` |
| **E2E framework** | Playwright | Cypress | Playwright multi-browser + headed/headless; preferred by Codiste |
| **DB** | PostgreSQL 16 | — | Already fixed at Stage 6 (Q5=A) |
| **Email stub** | console.log of JSON (no library) | — | Q2 of Stage 8: 7-field shape — no library needed |
| **Container** | docker-compose | — | Already fixed at Stage 4 (B10=A) |

---

## Hard rules (NOT pod-overridable at Stage 11 without re-running this stage)

1. **TypeScript / Node.js** is the backend language (Stage 9 Q4=A binding).
2. **PostgreSQL 16** is the data store.
3. **`docker-compose`** is the dev/run env.
4. **Argon2id** is the password algorithm.
5. **RS256** is the JWT algorithm.
6. **OpenAPI 3.1** is the API contract source-of-truth.

---

## Soft preferences (pod can flip at Stage 11)

1. NestJS vs Express vs Fastify vs Hono — Stage 11 chooses
2. Prisma vs Drizzle — Stage 11 chooses
3. Next.js vs Vite-React — Stage 11 chooses
4. Vitest vs Jest — Stage 11 chooses
5. zod vs yup — Stage 11 chooses
