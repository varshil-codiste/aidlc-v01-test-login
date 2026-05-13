# Execution Plan — `roles-profile` UoW (Stage 7)

**Tier**: Feature     **Generated**: 2026-05-12T20:05:00+05:30
**Built on**: `aidlc-docs/inception/plans/execution-plan.md` (auth UoW base)

---

## Unit of Work nomination

**Single UoW**: `roles-profile` — full-stack thin slice extending `auth`.

### Why one UoW, not multiple
- All three Tier-1 stories (US-009/010/011) share the same data-model amendment (`role` on User). Splitting would require either (a) shipping a temporary partial schema, or (b) coordinating two PRs against the same migration. Both are net-negative for a small Feature.
- All three FE artifacts (`signup-form` edit, `<RoleBadge>`, `/profile` page + dashboard link) ship in the same Next.js build.
- Independently deployable: yes — DB migration `0002_add_role` is the only ordering constraint, and the migration is backwards-compatible thanks to the `DEFAULT 'SELLER'`.

### Effort
**Small (S)** — well-bounded, no algorithmic novelty, no new module, no new endpoint.

### Code organization (inherited from auth)
- `apps/backend/` — Nest app
- `apps/frontend/` — Next app
- `apps/backend/prisma/migrations/0002_add_role/` — new migration
- `shared/role.ts` (new) — shared TS union for FE + BE alignment per NFR-MAINT-003

### Construction loop for this UoW (Stages 8 → 14)
1. **Stage 8 — Functional Design**: amend `business-rules.md` with role rules (BR-A13 role-at-signup, BR-A14 role-data-model, BR-A15 header-badge, BR-A16 profile-route); list new FE components in `frontend-components.md` (the 5 new/changed components).
2. **Stage 9 — NFR Requirements + /grill-me-1**: Feature-tier /grill-me-1 = 7-10 questions; quiz on the role-data flow + accessibility for radio/badge + backwards-compat for existing users.
3. **Stage 10 — NFR Design**: most patterns inherited (`P-SEC-*`, `P-A11Y-*`); new logical component: `LC-014 RoleBadge` (FE-only).
4. **Stage 11 — Stack Selection**: INHERIT all auth stack choices verbatim. No new dependencies. (No new libraries for radio — use the same FormInput/RadioGroup pattern from auth's form components; or add `@radix-ui/react-radio-group` if we want a built primitive — TBD at Stage 11.)
5. **Stage 12 — Code Generation (Gate #3)**: ~12 files (1 migration + 1 DTO edit + 1 service edit + 1 repo edit + 1 controller edit + 1 shared type file + 1 form-component edit + 1 RoleBadge + 1 ProfilePage + 1 Dashboard edit + 1 integration spec + 1 Playwright e2e amendment).
6. **Stage 13 — Code Review**: full lint + security + tests + AI review.
7. **Stage 14 — Manual QA + /grill-me-2 + Gate #4**: ~10 scenarios (one per US AC); /grill-me-2 = 7-10 questions.

### Operations stages
Per Feature-tier rule: Deployment + Observability only if changed. This UoW only adds one DB migration; Observability is unchanged. Stage 16 amends the auth deployment guide with a one-paragraph migration step. Stage 17 (IaC) — N/A (no infra change). Stage 18 (Observability) — N/A.

Gate #5 (Production Readiness) re-runs against the combined `auth` + `roles-profile` state.

---

## Sequence
1. Sign Gate #2 (this signoff file).
2. Resume `auth` UoW /grill-me-2 → Gate #4 → Stages 15-19 → Gate #5  **OR**  start `roles-profile` Stage 8 immediately and run the two UoWs in parallel until they both reach Gate #4. Pod's choice — captured in `roles-profile-execution-plan-signoff.md` below.

## Estimate
- Stage 8: 1 short turn (BR amendments)
- Stage 9 + /grill-me-1: 2 turns (NFR + quiz)
- Stage 10: 1 short turn
- Stage 11: 1 short turn (inherit confirmation)
- Stage 12: 1-2 turns (write ~12 files)
- Stage 13: 1 turn
- Stage 14 + /grill-me-2: 2-3 turns
- Stage 16 amendment + Gate #5: 1-2 turns

Total: ~10-12 turns (plus Manual-QA walk if pod runs locally vs delegation).

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T20:05:00+05:30 | AI-DLC | Initial creation. Single-UoW execution plan; Feature-tier light ceremony. |
