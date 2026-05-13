# Stage 19 — Production Readiness Checklist (combined: auth + roles-profile)

**Generated**: 2026-05-13T12:42:00+05:30     **Scope**: Gate #5 pre-flight

---

## Construction gates
- [x] Gate #1 — Business Requirements signed (auth: 2026-05-12; roles-profile: 2026-05-12)
- [x] Gate #2 — Workflow Plan signed (auth: 2026-05-12; roles-profile: 2026-05-13 sequencing A)
- [x] Gate #3 — Code Generation plan signed (auth: 2026-05-12; roles-profile: 2026-05-13)
- [x] Gate #4 — Code Review countersigned (auth: 2026-05-13; roles-profile: 2026-05-13)

## Functional gates (per UoW)
- [x] auth — 12 BR-Axx rules all implemented + verified
- [x] roles-profile — 4 new BR-A13..A16 rules implemented + verified (BR-A13 role-at-signup, BR-A14 role-data-model, BR-A15 header-badge, BR-A16 profile-route)
- [x] 8 user stories US-001..US-008 (auth) shipped with ACs verified at Stage 14
- [x] 3 user stories US-009..US-011 (roles-profile) shipped with ACs verified at Stage 14

## Quality gates
- [x] Lint clean — BE + FE both `--max-warnings 0`
- [x] Type-check clean — `tsc --noEmit` exit 0 for BE + FE
- [x] BE workspace tests — 17/17 PASS (3 unit + 6 integration + 8 PBT)
- [x] Property-based invariants — all 4 hold (email-normalize idempotence, password-hash round-trip, JWT round-trip, refresh rotation)
- [x] Manual QA cycle-1 (auth) — 11/15 PASS + 4 N/A + 0 FAIL
- [x] Manual QA cycle-1 (roles-profile) — 10/10 PASS
- [x] Manual QA cycle-2 (auth regression after roles-profile) — 11/15 PASS + 4 N/A + 0 FAIL → no new bug
- [x] /grill-me-2 PASS — auth 12/12 + roles-profile 8/8 (both AI-assisted under Codiste learning-experiment scope; honesty caveat in results)
- [x] Migration `0002_add_role` applied + verified backwards-compatible (pre-existing rows backfilled to SELLER)
- [x] Production build (BE + FE) succeeds (`npm run build` on both workspaces; exit 0)

## Security gates
- [x] Argon2id frozen params (memoryCost 19_456, timeCost 2, parallelism 1) — NFR-S01
- [x] RS256 JWT signing + JWKS endpoint — NFR-S02
- [x] Cookies HttpOnly + SameSite=Lax + Path=/ (+ Secure when APP_ENV != dev) — NFR-S03, BR-A10
- [x] Login rate-limit 5/15min + `Retry-After: 900` header — NFR-S04, BR-A06
- [x] Enumeration safety — byte-identical responses for dup-signup vs wrong-password-login — NFR-S09, BR-A07
- [x] Refresh rotation + replay → family-revoke — NFR-S10, BR-A09
- [x] Logger PII redaction (password / token / Argon2 hash / JWT prefix) — NFR-S07
- [x] RFC 7807 error envelope on every BE error
- [x] Helmet security headers — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, X-XSS-Protection — verified live
- [x] Role enum server-side authoritative — NFR-S11 (P-SEC-011 / `z.enum(ROLES)` + Postgres native enum)
- [ ] **NFR-S08 — npm audit clean (prod path, high+critical)** — ❌ NOT MET → **ACCEPTED-WITH-DEFERRED-REMEDIATION** (see Open Risks #1)

## Accessibility gates
- [x] Paired labels on form inputs — NFR-A01
- [x] Visible focus rings — NFR-A02
- [x] Errors not colour-only (icon + text) — NFR-A03
- [x] Contrast ≥ 4.5:1 verified for text — NFR-A04 (token darken applied)
- [x] Keyboard nav order matches visual — NFR-A05 (verified statically)
- [x] Unique `<h1>` per route — NFR-A06
- [x] Touch targets ≥ 44px — NFR-A07
- [x] Errors linked via `aria-describedby` / `aria-invalid` / `aria-live="polite"` — NFR-A08
- [x] Role-badge a11y — `aria-label="You are signed in as a {Role}"`, text-label (not colour-only), contrast ≥ 4.5:1 — NFR-A09
- [ ] **Live axe-core scan** — deferred — `@axe-core/playwright` declared but not installed in node_modules. Cycle-2 backlog: install axe + write `error-states.e2e.ts` + `a11y.e2e.ts`.

## Reliability gates
- [x] Fail-fast bootstrap (NFR-REL-003) — `assertEnv()` exits before HTTP server starts
- [x] Idempotent logout — calling `/auth/logout` twice returns 204 both times
- [x] Reversible DB migration — `0002_add_role/migration-rollback.sql` provided

## Operational gates
- [x] Deployment guide — `aidlc-docs/operations/deployment/deployment-guide.md` (combined auth + roles-profile)
- [x] Health probe — `GET /health`
- [x] JWKS readiness probe — `GET /.well-known/jwks.json`
- [x] Logs: structured JSON to stdout with redaction
- [x] Stage-15 build & test — BE + FE both production-build clean (`build-and-test-report.md`)
- [x] IaC summary — Stage 17 N/A (single-host docker-compose)
- [x] Observability — Stage 18 light (logs only; metrics/tracing N/A for v1)
- [ ] **Live Playwright e2e in CI** — deferred — specs exist, Playwright browsers not yet installed in CI image

## Pod
- [x] `aidlc-docs/pod.md` lists Chintan + Varshil
- [x] All Gate signatures captured with ISO dates

---

## Open Risks (decisions required from pod for Gate #5 sign-off)

| # | Risk | Resolution required at Gate #5 |
|---|------|--------------------------------|
| 1 | **NFR-S08 fail** — 5 high-severity prod-dep vulns (multer, lodash, js-yaml, @nestjs/core, next) | Confirm the **ACCEPTED-WITH-DEFERRED-REMEDIATION** disposition stands for v1, OR halt and execute the NestJS 10 → 11 + Next 14 → 16 major bumps before deploy. Recommended: defer for v1 (zero `@UploadedFile()` exposure; mitigations in dependency upgrade scheduled before public traffic). |
| 2 | **No live axe-core scan** ran cycle 1 | Either accept that static a11y inspection is sufficient for v1, OR install `@axe-core/playwright` + write `a11y.e2e.ts` and re-run Stage 14 before sign-off. |
| 3 | **No live Playwright e2e in CI** | Either accept manual QA as the canonical Stage-14 evidence, OR add Playwright browser install + browser-driven e2e to `.github/workflows/ci.yml` before sign-off. |
| 4 | **/grill-me-2 was AI-assisted** for both UoWs (Codiste learning-experiment context) | If this experiment is also a "team comprehension" gate, schedule an unaided read-back session with Chintan or Varshil before any production decision. If the experiment goal is purely workflow demonstration, the gate stands. |

---

## Verdict

All construction + quality + most security/a11y/operational gates **PASS**. Four explicit caveats require pod acknowledgement at Gate #5 — none are correctness defects.

▶ Ready for Gate #5 pod countersign. See `production-readiness-signoff.md`.

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:42:00+05:30 | AI-DLC | Initial creation. Combined checklist for auth + roles-profile cycle 1. All construction gates PASS; 4 open risks for Gate #5. |
