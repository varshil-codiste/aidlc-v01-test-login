# NFR Design Checklist — `roles-profile` UoW

**Tier**: Feature     **Stage**: 10     **Generated**: 2026-05-13T09:52:00+05:30

Feature-tier light ceremony — patterns + LCs amend the auth base.

## Coverage
- [x] **Patterns** — 4 new (`P-SEC-011`, `P-A11Y-009`, `P-A11Y-010`, `P-MAINT-003`); all auth patterns inherited.
- [x] **Logical components** — 3 new (LC-014 `<RoleBadge/>`, LC-015 `<RoleRadioGroup/>`, LC-016 `<ProfilePage/>`); 13 auth LCs inherited.
- [x] **No new BE LC** — role plumbing extends existing LCs by method-signature only.
- [x] **NFR ↔ Pattern ↔ LC traceability** — every new NFR has at least one owning pattern AND one verification stage.
- [x] **Inherited compliance unchanged** — no auth pattern or LC is contradicted by the new ones.

## Open items for downstream stages
- Stage 11: confirm whether to use native `<input type="radio">` or upgrade to `@radix-ui/react-radio-group`.
- Stage 12: implement the role-source-of-truth unit test in `apps/backend/tests/unit/role-source-of-truth.spec.ts`.
- Stage 14: axe-core scan on `/signup`, `/dashboard`, `/profile` + keyboard-only walkthrough.

## Quality gates
- [x] Patterns naming continuation (`P-SEC-011`, `P-A11Y-009/010`, `P-MAINT-003`).
- [x] LC numbering continuation (`LC-014..016`).
- [x] All new patterns reference at least one BR.
- [x] All new LCs reference at least one NFR + one BR (transitively).

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:52:00+05:30 | AI-DLC | Initial creation. Stage 10 checklist for Feature UoW. |
