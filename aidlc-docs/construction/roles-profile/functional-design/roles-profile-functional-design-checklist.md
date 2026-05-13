# Functional Design Checklist — `roles-profile` UoW

**Tier**: Feature     **Stage**: 8     **Generated**: 2026-05-13T09:35:00+05:30

Feature-tier light ceremony — single UoW, amendment over the auth UoW base.

---

## Coverage

| Artifact | Status | File |
|----------|--------|------|
| Business rules amendment | ✅ | `roles-profile-business-rules.md` |
| Domain entity delta | ✅ | `roles-profile-domain-entities.md` |
| Frontend components delta | ✅ | `roles-profile-frontend-components.md` |

Skipped per tier: `business-logic-model.md` (no new service or sub-flow — signup flow already documented in auth; the new logic is a one-line "forward role" into the existing service). The sequence diagram delta for signup lives in the Application Design (`roles-profile-application-design.md`).

## Traceability

| Story (US) | Acceptance criteria | Business rules | NFR coverage | Component touchpoint |
|------------|--------------------|-----------------|---------------|------------------------|
| US-009 (sign up with role) | AC1..AC6 | BR-A13, BR-A14 | NFR-S11, NFR-T05, NFR-MAINT-003 | `<RoleRadioGroup/>`, `<SignupForm/>`, BE signup DTO |
| US-010 (header role badge) | AC1..AC5 | BR-A15 | NFR-A09, NFR-S07 | `<RoleBadge/>`, header layout |
| US-011 (profile + logout) | AC1..AC6 | BR-A16, BR-A09 (logout) | NFR-A09 | `<ProfilePage/>`, `<DashboardPage/>` amendment |

## Quality gates

- [x] **Naming continuity** — BR rules continue auth's numbering (`BR-A13..A16`).
- [x] **No new error codes outside the auth namespace** — single new code `auth.role.invalid` reuses the `auth.*` family.
- [x] **One Mermaid diagram delta** — captured in the Application Design (signup sequence). No new ER diagram entity; only the `User` field annotation.
- [x] **Compliance with the auth UoW invariants** — no rule contradicts BR-A01..A12.
- [x] **Single source of truth for the role union** — NFR-MAINT-003 satisfied by `shared/role.ts` (called out in BR-A14 + frontend-components delta).
- [x] **Accessibility called out per-component** — NFR-A09 mapped into `<RoleRadioGroup/>`, `<RoleBadge/>`, `<ProfilePage/>`.
- [x] **No new dependency at this stage** — Stage 11 will confirm whether to add `@radix-ui/react-radio-group` or stay with the native `<input type="radio">`.

## Open items for downstream stages

| Item | Stage |
|------|-------|
| Confirm radio primitive choice (native vs `@radix-ui/react-radio-group`) | 11 |
| Property-based tests for role union (if any) | 9 (NFR list) / 12 (impl) |
| Migration `0002_add_role` SQL + Prisma generate | 12 |
| Integration test `signup-role.int-spec.ts` (NFR-T05) | 12 |
| Playwright e2e amendment covering US-009/010/011 | 12 |
| axe-core verification of the badge contrast in the assembled header | 14 |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:35:00+05:30 | AI-DLC | Initial creation. Stage 8 checklist for Feature UoW; all 3 light-ceremony artifacts present; traceability matrix populated. |
