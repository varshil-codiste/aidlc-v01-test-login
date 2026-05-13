# Stack Selection Checklist — auth UoW

**Generated**: 2026-05-12T00:22:00Z

## Items

### Section 1 — Coverage
- [x] Every stack in scope has all framework choices made
  - FE: Next.js + Tailwind/shadcn + TanStack Query
  - BE Node: NestJS + Prisma + Vitest + ESLint/Prettier
  - Shared: OpenAPI 3.1 + Self-hosted cloud target
- [x] Conventions file loaded for FE (`.aidlc/aidlc-rule-details/construction/stacks/frontend-conventions.md`)
- [x] Conventions file loaded for BE Node (`.aidlc/aidlc-rule-details/construction/stacks/node-conventions.md`)
- [~] N/A: Python conventions (no Python in UoW)
- [~] N/A: Go conventions (no Go in UoW)
- [~] N/A: Flutter conventions (no Mobile in UoW)

### Section 2 — NFR alignment
- [x] **NFR-PERF-001 (p95 ≤ 200ms)**: Next.js SSR + NestJS DI + Prisma + single-process — comfortably within target at ≤ 50 users
- [x] **NFR-PERF-002 (Lighthouse ≥ 90)**: Next.js App Router supports SSR + code-splitting + critical CSS
- [x] **NFR-SEC-001 (Argon2id)**: `argon2` npm pkg pinned
- [x] **NFR-SEC-002 (RS256 + JWKS)**: `jose` pinned (first-party JWKS preferred over `jsonwebtoken`)
- [x] **NFR-SEC-005 (security headers)**: `helmet` pinned + custom CSP middleware
- [x] **NFR-SEC-006 (server-side validation)**: `zod` + `nestjs-zod` pinned (replaces NestJS default `class-validator`)
- [x] **NFR-A11Y-001..008**: `radix-ui` (via shadcn) ships AA-compliant primitives; `@axe-core/playwright` in E2E
- [x] **NFR-OBS-001 (JSON logs)**: `pino` + `nestjs-pino` pinned with `aidlc-profile.md` required-fields schema
- [x] **NFR-TEST-002 (PBT)**: `fast-check` pinned as devDep; matches Stage 9 NFR-TEST-003 framework choice
- [x] **NFR-TEST-005 (E2E)**: Playwright pinned

### Section 3 — Cloud / IaC alignment
- [x] Cloud target = self-hosted (F.2=A); consistent with Stage 7 SKIP of Stage 17 IaC
- [x] CI = GitHub Actions (Codiste preset; confirmed at Stage 16)

### Section 4 — Greenfield-only check
- [x] No existing stack to inherit (greenfield); all choices are net-new — no pod "inheritance" confirmation needed

### Section 5 — Stage 11 question answers (9/9)
- [x] A.1 FE framework → B (Next.js — recommended, letter happens to be B not A)
- [x] A.2 UI library → A (Tailwind + shadcn/ui)
- [x] A.3 Server state → A (TanStack Query)
- [x] B.1 BE framework → A (NestJS)
- [x] B.2 ORM → A (Prisma)
- [x] B.3 Test runner → A (Vitest)
- [x] B.4 Lint/format → A (ESLint + Prettier)
- [x] F.1 Contract → A (OpenAPI 3.1)
- [x] F.2 Cloud target → A (Self-hosted)

### Section 6 — Routing
- [x] aidlc-state.md updated — Stage 11 COMPLETE for `auth`
- [x] audit.md updated
- [x] Next stage = **Stage 12 Code Generation (Gate #3)**

## Findings worth surfacing before Stage 12

| # | Finding | Severity | Stage 12 disposition |
|---|---------|----------|----------------------|
| 1 | NestJS default validator is `class-validator`; we override to **`nestjs-zod`** to keep validation schemas single-source-of-truth with the OpenAPI emitter. Stage 12 codegen plan must explicitly wire this. | DECISION | Stage 12 |
| 2 | Frontend uses `react-hook-form` + `zod resolver`, not `react-final-form` or controlled-only — Stage 12 codegen plan should align. | DECISION | Stage 12 |
| 3 | RS256 keypair must be generated at first run via `scripts/gen-keys.sh` (a one-shot openssl invocation); env-vars `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` ingest the PEMs at boot. Stage 12 codegen plan must include this script. | DECISION | Stage 12 |
| 4 | Email-stub schema is the 7-field shape from Stage 8 Q2=A — Stage 12 must emit it via `pino.info('email_verification_stub', {...})`. | DECISION | Stage 12 |
| 5 | NFR-MAINT-002 (cyclomatic ≤ 10) — requires `eslint-plugin-sonarjs` config in `eslint.config.js` (a Codiste-house lint preset). | DECISION | Stage 12 |
| 6 | NFR-SEC-004 (rate limit) — NestJS `@nestjs/throttler` provides a Redis adapter; for v1 we use the in-memory storage (default). Stage 12 wires this via custom guard. | DECISION | Stage 12 |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T00:22:00Z | AI-DLC | Initial creation. Stage 11 COMPLETE for `auth` UoW. All Codiste-preset choices accepted (1 letter is B because the recommended was B; all others A). 6 findings carried to Stage 12 codegen plan. |
