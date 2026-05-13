# Stack Selection Checklist — `roles-profile` UoW

**Tier**: Feature     **Stage**: 11     **Generated**: 2026-05-13T09:55:00+05:30

## Coverage
- [x] All auth stack choices inherited verbatim — no version bump.
- [x] Radio primitive decision resolved (native HTML; pod chose A on 2026-05-13).
- [x] Shared boundary file path locked (`shared/role.ts`).
- [x] DB choice locked (Postgres enum, not CHECK constraint).
- [x] Migration naming locked (`0002_add_role`).
- [x] No new top-level dependency.
- [x] Dependency manifest delta is the empty set.
- [x] File-layout delta enumerated.

## Quality gates
- [x] Every decision (D-RP-001..004) maps to at least one BR or NFR.
- [x] No conflict with auth Stage 11 choices.
- [x] SBOM impact is zero.

## Open items for downstream stages
- Stage 12: write the SQL migration + Prisma generate + the unit test asserting Prisma enum ≡ shared `ROLES`.
- Stage 12: write `signup-role.int-spec.ts` integration test against real Postgres.
- Stage 12: write the Playwright e2e amendment covering US-009/010/011.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:55:00+05:30 | AI-DLC | Initial creation. Stage 11 checklist for Feature UoW; pod picked native radio. |
