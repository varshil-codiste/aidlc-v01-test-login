# Business Requirements — `roles-profile` UoW

**UoW**: `roles-profile`     **Tier**: Feature     **Built on**: `auth` UoW
**Generated**: 2026-05-12T19:55:00+05:30
**Source**: `sources/source-005-roles-profile-text.md` + Q1-Q8 + clarifications C1-C3

---

## Section A — Feature definition

### A.1 Feature title
**Add Merchant / Seller user roles + a Profile page (Logout retained)**

### A.2 Linked epic / parent product area
Auth / Identity (the `auth` UoW). This Feature UoW augments — does not replace — the auth flow that's already built.

### A.3 Target persona
Same single persona as the auth UoW: **Codiste teammate**. The feature splits the persona into two role-flavours: **Merchant** and **Seller**. Both flavours share the same auth flow today; the role is a signup-time declaration.

### A.4 User value statement
**As a** Codiste teammate signing up for the first time,
**I want** to declare whether I'm a Merchant or a Seller during signup AND see my role badge in the header after login AND have a dedicated `/profile` page to view my account details,
**so that** my role identity is captured from the start and I have an obvious place (Profile) separate from the home Dashboard to inspect my account.

### A.5 Success metric (learning-experiment scope)
- **Functional acceptance**: a Merchant signup + login + header-badge + visit /profile + logout works end-to-end; same for Seller — both via Playwright e2e.
- **Adoption / business-metric**: N/A — internal learning experiment, no production rollout target.

### A.6 Scope boundaries — v1
**In v1 (per Q1-Q8 + C1-C3 answers)**:
- Signup form gains an `"I am a..."` radio: Merchant / Seller (Q2 = A).
- `users` table gains a `role` enum column (`MERCHANT` | `SELLER`); existing rows default to `SELLER` via DB migration (Q6 = A).
- App layout header renders a small "Merchant" / "Seller" badge after login (C3 = A).
- New `/profile` route is added; reachable from `/dashboard` via a link.
- `/profile` shows the **baseline auth fields only** — email, display_name, timezone, account_setup_completed (Q4 = A).
- `/dashboard` remains the post-login landing page (greeting + Logout) (Q5 = B + C1 = B).
- Logout button on **both** `/dashboard` AND `/profile` (C1 = B).
- `GET /users/me` response gains a `role` field.
- Profile layout is one component with role-conditional fields (Q3 = A) — but per Q4 there are NO role-specific fields in v1, so this is structural only (the conditional branches exist in code, ready for v2 fields).

**Deferred / out-of-scope in v1**:
- Role-specific routes (RBAC) — Q7 was downgraded via C2 to "descriptive only"
- Role-specific signup fields (business_name, payout method, etc.) — Q8 = A
- Role-specific profile fields — Q4 = A only
- Role change after signup (no edit-profile-role flow)
- Admin role-management UI
- Avatar / phone / address fields — Q4 excluded D, E, F
- Profile picture upload pipeline

---

## Section B — Integration & rollout

### B.1 Existing components affected
**`auth` UoW** is the sole upstream. Specific files / contracts that change:

| Layer | Affected artifact | Change |
|-------|-------------------|--------|
| DB | `users` table (`prisma/schema.prisma` + new migration `0002_add_role`) | Add `role` column (Postgres enum: `MERCHANT`, `SELLER`); default `SELLER` for existing rows; add `role` to `User` Prisma type |
| BE — DTO | `dto/signup.dto.ts` | Add `role: 'MERCHANT' \| 'SELLER'` (zod enum, required) |
| BE — Service | `auth/auth.service.ts` (signup) + `users/users.repo.ts` (create) | Accept `role` from DTO; persist on insert |
| BE — Endpoint | `GET /users/me` (in `users/users.controller.ts` / `users.service.ts`) | Include `role` in the sanitized response |
| BE — JWT | `jwt-signer.service.ts` | **Decision**: do NOT include role in JWT claims (role is mutable in theory + FE reads from `/users/me`). Keeps token small; aligns with current design where `sub` is the only access-claim. |
| FE — Form | `src/components/forms/signup-form.tsx` | Add a `<RadioGroup>` for role with two options; required field |
| FE — Layout | `src/app/layout.tsx` (or a new `src/components/header.tsx`) | Add a role badge — small pill rendered next to the signed-in user's display_name |
| FE — API client | `src/api/client.ts` + `src/use-auth.tsx` | `User` type gains `role`; reading from `GET /users/me` propagates it |
| FE — Routes | `src/app/profile/page.tsx` (new) | New `/profile` route + page component; renders email + display_name + timezone + account_setup_completed; Logout button; link back to `/dashboard` |
| FE — Routes | `src/app/dashboard/page.tsx` (existing) | Add a "View Profile" link / button pointing to `/profile`; keep greeting + Logout |
| FE — Auth guard | `src/components/auth-guard.tsx` | Unchanged — same auth rules for both routes |
| Docs | `aidlc-docs/construction/roles-profile/*` | New per-UoW design + checklist trail (Stages 8-14) |

### B.2 Backwards-compatibility requirements
| Concern | Requirement |
|---------|-------------|
| Existing User rows | DB migration must set `role='SELLER'` on all existing rows so reads don't break |
| Existing API contract | `POST /auth/signup` becomes incompatible at the JSON-body level (`role` is now required). This is acceptable because the FE is the only client AND the FE ships with the same Feature. Old FE binaries cannot signup against the new BE — but there are no old FE binaries deployed. Document as breaking change in `auth-code-summary.md` amendment when this UoW ships. |
| Existing JWTs | Unchanged — role is NOT in token. Currently-signed-in users continue to work; their `GET /users/me` response now includes their default-`SELLER` role. |
| Existing `/dashboard` | Unchanged in behavior. Gains one new link (additive). |

### B.3 Feature flag plan
**No flag in v1.** Rationale: (a) internal Codiste learning experiment, no production users to gate; (b) feature is additive — turning it off would require reverting the DB migration which is more work than the flag itself; (c) keeps the scope small. If we ship this beyond the team, a Stage-18 follow-up should add a `FEATURE_ROLES_ENABLED` env-var gate.

### B.4 Rollout plan
**Internal-only, learning experiment.**
- Land code → manual QA on `localhost:3000` (per Stage 14 path-1) → countersign Gate #4 → push to repo
- No staging / beta / GA waves
- No customer comms

---

## Pre-filled checklist self-audit (per `common/checklist-conventions.md`)
- [x] A.1 Feature title — filled
- [x] A.2 Linked epic — filled (Auth / Identity / `auth` UoW)
- [x] A.3 Target persona — filled (Codiste teammate, two role-flavours)
- [x] A.4 User value statement — filled
- [x] A.5 Success metric — filled (functional acceptance; adoption N/A)
- [x] A.6 Scope boundaries — filled (in-scope + out-of-scope explicit)
- [x] B.1 Existing components affected — filled (per-layer table)
- [x] B.2 Backwards-compat — filled (DB default + API breaking-change note)
- [x] B.3 Feature flag plan — filled (no flag in v1, justified)
- [x] B.4 Rollout plan — filled (internal-only)
**Total: 10 / 10 ✓**

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T19:55:00+05:30 | AI-DLC | Initial generation from Q1-Q8 + C1-C3 answers; Feature-tier 10-item checklist all filled. |
