# Business Requirements Checklist — `roles-profile` UoW

**Tier**: Feature     **Generated**: 2026-05-12T19:55:00+05:30
**Source content**: `roles-profile-business-requirements.md`

## Items
- [x] A.1 Feature title — "Add Merchant / Seller user roles + Profile page (Logout retained)"
- [x] A.2 Linked epic / parent product area — Auth / Identity (auth UoW)
- [x] A.3 Target persona — Codiste teammate (split into Merchant / Seller flavours by signup-time declaration)
- [x] A.4 User value statement — "As a Codiste teammate signing up for the first time, I want to declare whether I'm a Merchant or a Seller during signup AND see my role badge in the header after login AND have a dedicated /profile page, so that my role identity is captured from the start and I have an obvious place to inspect my account separate from /dashboard"
- [x] A.5 Success metric — Functional acceptance via Playwright e2e (both roles sign up + log in + see badge + visit profile + log out). Adoption N/A (internal experiment)
- [x] A.6 Scope boundaries — explicit in-scope (8 items) + out-of-scope (7 items) lists documented in BR § A.6
- [x] B.1 Existing components affected — `auth` UoW: DB schema (new migration), DTOs, services, repos, FE forms + layout + new /profile + amended /dashboard
- [x] B.2 Backwards-compatibility — DB migration defaults existing rows to `SELLER`; `POST /auth/signup` becomes role-required (documented breaking change to JSON body)
- [x] B.3 Feature flag plan — no flag in v1 (justified — internal experiment, additive feature)
- [x] B.4 Rollout plan — internal-only, no staging/beta/GA waves

## Validation
- [x] Every item resolved (no [ ] PENDING remaining)
- [x] No `[~] N/A` items — every Feature-tier checklist item is genuinely applicable
- [x] Contradictions surfaced from round-1 answers were resolved via `roles-profile-br-clarifications.md` (C1=B, C2=descriptive only, C3=A header badge)
- [x] Sources file + manifest updated (`source-005-roles-profile-text.md` + `manifest.md`)
- [x] Tier file written (`tier-roles-profile.md`)

## Gate #1 readiness
- [x] All 10 checklist items resolved
- [x] BR doc generated (`roles-profile-business-requirements.md`)
- [ ] Gate #1 signoff template filled + countersigned by Tech Lead + Dev — see `roles-profile-br-signoff.md`

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T19:55:00+05:30 | AI-DLC | Initial creation; all 10 items pre-filled from BR doc. |
