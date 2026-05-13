# NFR Requirements — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:40:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/nfr-requirements/auth-nfr-requirements.md`

---

## Inherited (unchanged)
- **Security**: NFR-S01..S10 (Argon2id frozen params, RS256 JWT, cookie flags, rate-limit, RFC 7807, logger redaction, enumeration safety, refresh rotation, family revoke).
- **Performance**: NFR-P01..P03 (p95 < 200 ms on auth endpoints; signup < 600 ms with Argon2id; concurrent-login N=50 baseline).
- **Reliability**: NFR-R01..R02 (graceful BE restart; DB migration is reversible).
- **Accessibility**: NFR-A01..A08 (paired labels, focus rings, contrast ≥ 4.5:1, keyboard order, h1 per route, ≥44px hit targets, error-input link).
- **Testability**: NFR-T01..T04 (unit ≥ 80% coverage on services; integration tests for happy/sad paths; property-based 4 invariants; e2e Playwright).
- **Observability**: NFR-OBS-001..004 (JSON stdout logs, request_id, structured fields, no PII).
- **Maintainability**: NFR-MAINT-001..002 (typed shared boundary; OpenAPI 3.1 schema is the contract).

---

## New NFRs (delta — promoted from `roles-profile-requirements.md`)

### NFR-S11 — Role enum is server-side authoritative
**Statement**: The set of legal `role` values is enforced by Postgres' enum type AND by the BE zod schema on every request that mutates or accepts a role. The FE TS union is convenience only — never the security boundary.
**Verification**:
- Integration test sends `role: "ADMIN"` (or `null`, `""`, `123`) to `POST /auth/signup` → expects 400 with `auth.role.invalid`.
- Integration test sends a valid `role` for which the corresponding zod schema is bypassed (negative test) → expects request rejected by the Postgres enum at INSERT.
**Owning rules**: BR-A13, BR-A14.

### NFR-A09 — Role radio + badge accessibility (WCAG 2.2 AA)
**Statement**:
- The Signup role selection control is a labelled radio group (group label "I am a…"); per-radio paired labels; keyboard `Tab` focuses the group, ←/→/↑/↓ cycles radios, `Space` selects. Visible focus indicator ≥ 3:1 against surroundings.
- The header role badge has `aria-label="You are signed in as a {Role}"`; the badge is NOT colour-only — text label always present; contrast ≥ 4.5:1 against header surface.
- The Profile page is a `<main>` landmark with a single `<h1>` ("Your Profile"); the four read-only field rows use `<dl>/<dt>/<dd>` semantics; "Back to Dashboard" is a real `<a>`/`<Link/>`; Logout is a real `<button>`.
**Verification**:
- axe-core scan run during Stage 14 Manual QA on `/signup`, `/dashboard`, `/profile` — zero serious/critical findings.
- Keyboard-only walk-through of US-009 + US-010 + US-011 in Stage 14.
**Owning rules**: BR-A13, BR-A15, BR-A16.

### NFR-T05 — Signup-with-role integration coverage
**Statement**: A dedicated integration spec exercises the signup endpoint with: a valid role, a missing role (expect 400), an invalid role string (expect 400), and a `role=MERCHANT` value that produces a user row whose `role` reads back as `MERCHANT`. The test runs against the real Postgres in CI (no DB mocks).
**Verification**: `tests/integration/signup-role.int-spec.ts` is created at Stage 12 and runs green in Stage 13 lint+test step.
**Owning rules**: BR-A13.

### NFR-MAINT-003 — Single source of truth for the `Role` union
**Statement**: The set `{MERCHANT, SELLER}` is declared in exactly one file shared by FE and BE: `shared/role.ts`. Prisma's enum, BE's zod schema, and FE's TS union all import from (or are validated against) this declaration. A mismatch at any of the four sites is a Stage-13 blocking finding.
**Verification**:
- A repo-grep CI step (run during Stage 13) confirms no other file defines a `Role` enum/union literal outside `shared/role.ts`, `prisma/schema.prisma`, the migration file, and the import sites.
- The Prisma enum + zod enum are static-validated to match `shared/role.ts` at build time (or, equivalently, a unit test asserts the equality of the three constant sets).
**Owning rules**: BR-A14.

---

## Property-based tests — delta

The PBT extension is enabled (inherited from Stage 4 — A3=A user deviation). The role union introduces no new invariant beyond what's already on email/password/JWT/refresh — no new `*.prop-spec.ts` file is added by this UoW. (The Stage 11 Stack Selection may add a fifth invariant if the pod elects to, but the Feature scope here is fine without it.)

---

## Compliance matrix — delta

| Concern | NFR | Stage that proves it |
|---------|-----|----------------------|
| Server-side enum check | NFR-S11 | 12 (impl) + 13 (executed test) |
| A11y of radio + badge + profile | NFR-A09 | 12 (impl) + 14 (axe + keyboard) |
| Integration coverage of signup-role | NFR-T05 | 12 (write) + 13 (executed) |
| Role union single source | NFR-MAINT-003 | 12 (file layout) + 13 (grep step) |

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:40:00+05:30 | AI-DLC | Initial creation. Stage 9 NFR amendment for Feature UoW; 4 new NFRs promoted from requirements.md; all auth NFRs inherited unchanged. |
