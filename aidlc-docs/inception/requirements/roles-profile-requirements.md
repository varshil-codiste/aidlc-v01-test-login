# Requirements — `roles-profile` UoW

**Tier**: Feature     **Depth**: Standard
**Generated**: 2026-05-12T20:00:00+05:30
**Format**: amendment over `aidlc-docs/inception/requirements/requirements.md` (the auth UoW base). Numbering continues from where the base left off (FR-022 / NFR-S10).

---

## Intent Analysis (Step 2)
- **Request type**: New feature (additive over auth)
- **Scope**: Multiple components — DB (one migration), BE (DTO + repo + endpoint), FE (form + layout + new route + amended route)
- **Complexity**: Simple (well-scoped; no algorithmic novelty; all building on patterns already in place from auth)
- **Risk**: Medium — DB migration is the irreversible part (default-`SELLER` for existing rows); breaking change to `POST /auth/signup` body shape is documented but real

## Depth resolution (Step 3)
Feature default = Standard. No upgrade triggers fire (risk is Medium not High/Critical; reversibility OK with migration rollback script; single-team work; AI/ML extension NOT opted in). Depth confirmed: **Standard**.

## Extension status (inherited from project)
| Extension | Enabled | Applies to this UoW? | Notes |
|-----------|---------|---------------------|-------|
| Security Baseline | ✅ Yes (project-level A1=A) | Yes — role input is validated as strict enum; existing JWT + Argon2id rules continue |
| Accessibility (WCAG 2.2 AA) | ✅ Yes (project-level A2=A) | Yes — role radio + role badge must meet AA |
| Property-Based Testing | ✅ Yes (project-level A3=A) | Limited — no new PBT invariant needed (role is a closed two-element enum; trivial to enumerate); no new PBT files |
| AI/ML Lifecycle | ❌ No (project-level A4=C) | N/A |

No new opt-in question issued — Feature tier inherits project-level extension config per `requirements-analysis.md` Step 5.

---

## Functional Requirements — Amendments

### Amended FRs (from auth/requirements.md)

#### FR-001 (Signup form) — AMENDED
**Original**: Signup form collects email + display_name + password.
**Amendment**: Signup form ALSO collects a required `role` field (radio with two options: Merchant, Seller). The role is sent in the `POST /auth/signup` body as `"role": "MERCHANT" | "SELLER"`. Submit button stays disabled until role is selected (in addition to existing email/password/display_name validity).

#### FR-006 (Login flow) — UNCHANGED
Login does not collect role (the user already has one persisted from signup). Login response (`POST /auth/login`) gains the `role` field in the user payload because it's now on the User entity (FR-024).

#### FR-014 (Dashboard) — AMENDED
**Original**: Dashboard shows "Hello, {display_name}" + Logout.
**Amendment**: Dashboard ALSO shows a "View Profile" link/button that navigates to `/profile`. Greeting and Logout remain.

### New FRs

#### FR-023 — Role declaration at signup (Tier-1 critical)
The Signup form requires the user to select one of two role options before submission: **Merchant** or **Seller**. The role is captured at signup-time and persisted to the User row.

**Acceptance criteria**:
- Radio control with two options, both visible above the submit button
- Submit button stays disabled until a role is selected
- API rejects signup attempts with missing or invalid role values (zod enum validation → 400)

#### FR-024 — Role data model (Tier-1 critical)
The `users` table gains a `role` column of Postgres enum type `Role { MERCHANT, SELLER }`. The Prisma schema mirrors this. **Migration** `0002_add_role`:
1. `CREATE TYPE "Role" AS ENUM ('MERCHANT', 'SELLER')`
2. `ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'SELLER'` — existing rows automatically pick up `SELLER`
3. After the migration completes, the default may stay (no harm) OR be dropped later if we want all future signups to require explicit role

**Acceptance criteria**:
- Migration is idempotent (re-running is a no-op)
- A rollback `down` script exists that drops the column + enum type
- Existing User rows (from auth UoW) read as `role='SELLER'` post-migration without manual backfill

#### FR-025 — Role in `GET /users/me` response (Tier-1 critical)
The sanitized user record returned by `GET /users/me` (and by `POST /auth/signup` + `POST /auth/login` responses) gains a `role` field. Shape: `{ id, email, displayName, accountSetupCompleted, role }`. Password/passwordHash NEVER appears (unchanged from auth).

#### FR-026 — Role badge in app layout header (Tier-1 critical)
After authentication, the global app header renders a small badge labeled "Merchant" or "Seller". The badge:
- Reads `user.role` from the in-memory state populated by `GET /users/me`
- Uses a text label (not color-only conveyance — WCAG / NFR-A09)
- Is positioned next to the display_name in the header

**Acceptance criteria**:
- Badge visible on every authenticated route (Dashboard, Account Setup, Profile)
- Badge has `data-testid="role-badge"` and announces correctly to screen readers
- Hidden on unauthenticated routes (Landing, Signup)

#### FR-027 — Profile page (Tier-1 critical)
A new authenticated route `/profile` renders a single page that shows the baseline auth fields and provides a Logout action.

**Acceptance criteria**:
- Fields displayed: `email`, `display_name`, `timezone`, `account_setup_completed` (boolean rendered as "Yes" / "No")
- Logout button at bottom with `data-testid="profile-logout"`; clicking it calls `POST /auth/logout` (existing endpoint from auth) and redirects to `/` with the existing "Signed out" toast
- A "Back to Dashboard" link at top with `data-testid="profile-back-dashboard"` navigates to `/dashboard`
- Unauthenticated visit redirects to Landing (via existing `AuthGuard`)
- Layout is one component (`/profile/page.tsx`); role-conditional field-blocks exist in code but are empty stubs for v1 (per Q3 = A + Q4 = A)

#### FR-028 — Dashboard → Profile navigation (Tier-1 critical)
`/dashboard` gains a "View Profile" link/button (`data-testid="dashboard-view-profile"`) that navigates to `/profile`. Clicking does NOT alter session state.

#### FR-029 — Logout on both routes (Tier-1 critical)
Both `/dashboard` AND `/profile` have a Logout button. Both buttons invoke `POST /auth/logout` (single endpoint, no change to BE) and redirect to `/` with the "Signed out" toast.

### Tier-2 FRs (verification stories)

#### FR-030 — Backwards-compatibility verification
A migration-rollback test exists OR is documented in Stage 16 (Deployment Guide). For v1's internal-only rollout this can be a manual procedure documented in `roles-profile-deployment.md`.

---

## Non-Functional Requirements — Amendments

### Inherited NFRs (unchanged from auth)
- NFR-S01 (Argon2id), NFR-S02 (RS256 + JWKS), NFR-S03 (cookie flags), NFR-S04 (rate limit), NFR-S05 (security headers), NFR-S06 (input validation — adds the role enum), NFR-S07 (logger redaction), NFR-S09 (enumeration safety), NFR-S10 (refresh rotation)
- NFR-A01..A08 (accessibility — extended by NFR-A09 below)
- NFR-T01..T04 (testing — PBT not extended; 1 new integration test + Playwright e2e amendments)
- NFR-MAINT-001 (80% coverage), NFR-MAINT-002 (cyclomatic ≤ 10)
- NFR-OBS-001..005 (observability)
- NFR-REL-001..005 (reliability)

### New / amended NFRs

#### NFR-S11 — Role enum strict validation (Security extension)
The BE rejects any signup or future role-update request whose `role` value is not exactly `"MERCHANT"` or `"SELLER"`. zod enum: `z.enum(['MERCHANT', 'SELLER'])`. No coercion. Test: integration test in Stage 14.

#### NFR-A09 — Role-radio + role-badge accessibility (WCAG 2.2 AA)
- Role radio: each option is a `<label><input type="radio" />…</label>` pair; group has an `aria-labelledby` pointing to a group label; required-error appears via `aria-live="polite"` (same pattern as the existing Signup form errors)
- Role badge: text only (no color-only conveyance); contrast ≥ 4.5:1 against header background; has an `aria-label` like `"You are signed in as a Merchant"` (or "Seller")
- Both elements must be reachable via keyboard with visible focus rings

#### NFR-T05 — Role-aware integration test
A new BE integration test (`tests/integration/signup-role.int-spec.ts`) verifies: signup with `role: "MERCHANT"` returns 201 + user with `role: "MERCHANT"`; signup with `role: "INVALID"` returns 400; signup with missing role returns 400. Mirrors the patterns from `signup-enumeration.int-spec.ts`.

#### NFR-MAINT-003 — Role enum source of truth
The `Role` Postgres enum, the Prisma `Role` enum, the BE zod `z.enum`, and the FE TypeScript `type Role = 'MERCHANT' | 'SELLER'` MUST all agree. The Prisma-generated client is the canonical TS type used by BE; FE imports the same string-union from a shared file `shared/role.ts`. If the enum is ever amended, all four sites are updated in a single commit.

---

## User scenarios (preview — Stage 5 expands these into stories)

| # | Scenario | Happy / Edge | Maps to |
|---|----------|--------------|---------|
| 1 | Brand-new user signs up as Merchant | Happy | FR-023 + FR-024 + FR-026 |
| 2 | Brand-new user signs up as Seller | Happy | FR-023 + FR-024 + FR-026 |
| 3 | Signup with no role selected → submit blocked | Edge (FE) + 400 (BE) | FR-023, NFR-S11 |
| 4 | After login, header shows correct role badge | Happy | FR-025 + FR-026 |
| 5 | Existing auth-UoW user logs in → sees `SELLER` badge | Backwards-compat | FR-024 default behavior |
| 6 | Authenticated user visits `/profile` | Happy | FR-027 |
| 7 | `/dashboard` → "View Profile" → `/profile` | Happy | FR-028 |
| 8 | Logout from `/profile` | Happy | FR-029 |
| 9 | Logout from `/dashboard` (existing) | Regression | FR-029 inherits FR-015 |
| 10 | Unauth `/profile` visit | Edge | AuthGuard (unchanged) |

---

## Traceability map (BR ↔ FR ↔ NFR)
| BR item | FRs | NFRs |
|---------|-----|------|
| A.1 + A.4 (feature title + value statement) | FR-023, FR-026, FR-027, FR-029 | NFR-A09 |
| A.6 (scope: role at signup) | FR-023, FR-024, FR-025 | NFR-S11, NFR-MAINT-003 |
| A.6 (scope: header badge) | FR-026 | NFR-A09 |
| A.6 (scope: /profile page) | FR-027, FR-029 | inherited |
| A.6 (scope: /dashboard amended) | FR-014 (amended), FR-028 | inherited |
| B.1 (existing components affected) | all new FRs | NFR-MAINT-003 |
| B.2 (backwards compat / DB default) | FR-024, FR-030 | inherited |
| B.3 (no feature flag) | n/a | n/a |
| B.4 (internal rollout) | FR-030 | n/a |

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T20:00:00+05:30 | AI-DLC | Initial creation. Feature tier, Standard depth. 9 new FRs (023-030 + amendments to 001/006/014); 4 new/amended NFRs (S11, A09, T05, MAINT-003); 10 user scenarios; traceability map. |
