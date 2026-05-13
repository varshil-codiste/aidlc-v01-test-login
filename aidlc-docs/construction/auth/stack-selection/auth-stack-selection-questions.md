# Stack Selection — auth UoW

Backend language is **fixed = TypeScript / Node.js** (Stage 9 Q4=A binding). Data store is **Postgres 16** (ADR-004). Cookie auth + RS256 JWT are fixed. This file pins the remaining slots.

**Scopes in this UoW**: Frontend (Web) + Backend (Node.js) + Shared. Python/Go/Flutter blocks omitted (not in scope). Queue (F.3) and Vector store (F.4) omitted (NFR Design declared both N/A).

---

## Block A — Frontend (Web)

### Question A.1 — Frontend framework
A) React (with Vite) — minimal, flexible
B) **Next.js (App Router)** — SSR/SSG + integrated routing + Lighthouse-friendly **(Recommended — Codiste preset; supports NFR-PERF-002)**
C) Vue (Nuxt)
D) Astro
X) Other

[Answer]:B

### Question A.2 — UI library / styling
A) **Tailwind + shadcn/ui** — radix-ui under the hood (strong a11y baseline), tokens map cleanly to `design-tokens.md` **(Recommended — Codiste preset)**
B) Tailwind + Headless UI / Radix (without shadcn)
C) MUI / Mantine / Chakra
D) CSS Modules / vanilla-extract (no UI lib)
X) Other

[Answer]:A

### Question A.3 — Server-state management
A) **TanStack Query** (React Query) **(Recommended — Codiste preset; supports the `useAuth` hook pattern in services.md)**
B) RTK Query
C) SWR
D) None — fetch directly
X) Other

[Answer]:A

---

## Block B — Backend (Node.js, TS)

### Question B.1 — Node.js framework
A) **NestJS** — opinionated, TS-first, DI + decorators, middleware contracts closely match `application-design/services.md` **(Recommended — Codiste preset)**
B) Express — minimal; need to wire DI yourself
C) Fastify — performance-focused
D) Hono — lightweight, edge-runtime friendly
X) Other

[Answer]:A

### Question B.2 — ORM
A) **Prisma** — type-safe, generated client, migrations CLI **(Recommended — Codiste preset)**
B) Drizzle — SQL-first, lightweight, faster builds
C) TypeORM — class-based
D) Knex / raw SQL
X) Other

[Answer]:A

### Question B.3 — Test framework
A) **Vitest** — fast, ESM-native, fast-check integration **(Recommended — Codiste preset; supports PBT via `fast-check`)**
B) Jest
C) Node:test (built-in)
X) Other

[Answer]:A

### Question B.4 — Lint / format
A) **ESLint + Prettier** **(Recommended — Codiste preset)**
B) Biome (faster, single tool)
C) ESLint only
X) Other

[Answer]:A

---

## Block F — Shared / cross-stack

### Question F.1 — Contract format
A) **OpenAPI 3.1** — REST + auto-codegen for FE client **(Recommended — already fixed by ADR-001 + aidlc-profile)**
B) GraphQL SDL
C) Protobuf / gRPC
D) Shared TS types in a monorepo
X) Other

[Answer]:A

### Question F.2 — Cloud target (informs Stage 17 if executed)
A) **Self-hosted / on-prem** — learning experiment runs on docker-compose on a dev host, no cloud target **(Recommended for v1 — Stage 17 IaC is already SKIPPED per execution-plan.md)**
B) AWS (Codiste production default; activates if reused on client engagement)
C) GCP
D) Azure
E) Mixed
X) Other

[Answer]:A

---

## Fast path
Reply **`approved`** to accept all Codiste-preset Recommended answers (9 × A) and I'll generate Part 2:

1. `auth-stack-selection.md` — table of all 9 choices
2. Load `construction/stacks/frontend-conventions.md` (or equivalent if it exists; otherwise inline FE conventions in the stack-selection doc)
3. Load `construction/stacks/node-conventions.md` (or equivalent; otherwise inline BE conventions)
4. `auth-stack-selection-checklist.md`

Then the Stage 11 completion message → Continue → **Stage 12 — Code Generation (Gate #3)** where Chintan + Varshil sign the codegen plan before the AI writes any code.

Otherwise fill `[Answer]:` individually and reply **approved**.
