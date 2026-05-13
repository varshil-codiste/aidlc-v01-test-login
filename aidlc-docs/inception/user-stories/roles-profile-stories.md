# User Stories — `roles-profile` UoW

**Tier**: Feature     **Generated**: 2026-05-12T20:05:00+05:30
**Style**: INVEST + Given-When-Then     **Persona**: Codiste teammate (inherited from auth)
**Numbering**: continues from auth's US-008 → US-009, US-010, US-011

---

## US-009 — Sign up as a Merchant or Seller

**Persona**: CodisteTeammate (new — never signed up)
**Tier**: 1 — MVP critical
**Effort**: S
**Journey phase**: Register

**As a** Codiste teammate visiting the app for the first time,
**I want** to declare my role (Merchant or Seller) on the Signup form,
**so that** my role identity is captured the moment my account is created and can drive role-specific UI everywhere downstream.

### Acceptance Criteria
- [ ] **Given** I am on `/signup`, **When** the form renders, **Then** I see a required role group with two radios — "Merchant" and "Seller" — visually grouped with a paired label ("I am a…"), and the submit button is disabled until I pick one.
- [ ] **Given** I fill email + display_name + password (≥ 12 chars) + role = "Merchant", **When** I submit, **Then** `POST /auth/signup` returns 201, both auth cookies are set, and the response body's `user.role` field equals `"MERCHANT"`.
- [ ] **Given** I submit with role = "Seller", **When** the API responds, **Then** the same flow holds with `user.role === "SELLER"`.
- [ ] **Given** I attempt to submit with no role selected, **When** the FE validation runs, **Then** the submit button is disabled and an inline error explains "Please select a role".
- [ ] **Given** a malformed request reaches the BE (`role` missing or not in the enum), **When** the API responds, **Then** the response is 400 with an RFC 7807 envelope and `auth.role.invalid` code.
- [ ] **Given** I existed as an auth-UoW user (no role in DB), **When** the DB migration has run, **Then** my row reads back as `role='SELLER'` without any manual backfill.

### Cross-stack notes
- **FE**: Add `<RoleRadioGroup>` to `signup-form.tsx`; zod-validate the role union client-side; pass it through to `useAuth().signup({…, role})`.
- **BE**: `dto/signup.dto.ts` extends with `role: z.enum(['MERCHANT', 'SELLER'])`; `auth.service.ts.signup()` forwards role to `users.repo.create()`; the response `user` object always includes role (pulled from the row).
- **DB**: Migration `0002_add_role` adds Postgres `Role` enum + column + default; rollback drops both.

### Maps to requirements
FR-001 (amended), FR-023, FR-024, FR-025, NFR-S11, NFR-A09, NFR-MAINT-003, NFR-T05

---

## US-010 — See my role badge in the app header after login

**Persona**: CodisteTeammate (authenticated)
**Tier**: 1 — MVP critical
**Effort**: XS
**Journey phase**: Use (cross-cutting)

**As a** logged-in teammate,
**I want** a small "Merchant" or "Seller" badge in the app header,
**so that** my role identity is always visible and obvious without my having to navigate to a profile page.

### Acceptance Criteria
- [ ] **Given** I am authenticated, **When** any authenticated route renders (`/dashboard`, `/account-setup`, `/profile`), **Then** the global header shows a small text badge with my role (`"Merchant"` or `"Seller"`), placed next to my display_name.
- [ ] **Given** I am unauthenticated, **When** I view Landing or `/signup`, **Then** the role badge is not rendered.
- [ ] **Given** the badge is shown, **When** a screen reader announces the header, **Then** it reads "You are signed in as a Merchant" (or "Seller") via `aria-label`.
- [ ] **Given** the badge is shown, **When** I run an axe-core scan, **Then** the badge passes WCAG AA contrast (≥ 4.5:1 against header background) and is NOT colour-only (the text label conveys the role).
- [ ] **Given** I refresh the page or my access token silently rotates, **When** the FE rehydrates user state from `GET /users/me`, **Then** the badge still shows the correct role.

### Cross-stack notes
- **FE**: New `<RoleBadge>` component in `src/components/role-badge.tsx`; mounted in `src/app/layout.tsx` (or new `header.tsx`) behind the `useAuth()` check; reads `user.role` from query-cache.
- **BE**: No new endpoint — `GET /users/me` already exists (auth UoW); just extended in FR-025 to include role.

### Maps to requirements
FR-025, FR-026, NFR-A09, NFR-S07 (no PII leakage in the header — display_name + role only)

---

## US-011 — View my Profile from Dashboard, with Logout

**Persona**: CodisteTeammate (authenticated, setup-complete)
**Tier**: 1 — MVP critical
**Effort**: S
**Journey phase**: Use

**As a** logged-in teammate,
**I want** a `/profile` page reachable from `/dashboard` that shows my baseline account info and lets me log out,
**so that** I have a dedicated, navigable destination for my account separate from the Dashboard greeting page.

### Acceptance Criteria
- [ ] **Given** I am authenticated and setup-complete, **When** I visit `/dashboard`, **Then** I see a "View Profile" link/button (`data-testid="dashboard-view-profile"`) alongside the existing greeting + Logout.
- [ ] **Given** I click "View Profile", **When** the FE navigates, **Then** I land on `/profile`.
- [ ] **Given** I am on `/profile`, **When** the page renders, **Then** I see four read-only field-rows: `email`, `display_name`, `timezone`, `account_setup_completed` (rendered as "Yes" / "No"); a Logout button (`data-testid="profile-logout"`); and a "Back to Dashboard" link (`data-testid="profile-back-dashboard"`).
- [ ] **Given** I click Logout on `/profile`, **When** the BE responds, **Then** `POST /auth/logout` returns 204, both cookies are cleared via `Set-Cookie: Max-Age=0`, the refresh-token family is revoked, the FE shows the "Signed out" toast for ~5 seconds, and I am redirected to `/`.
- [ ] **Given** I click Logout on `/dashboard` (existing behaviour from US-005), **When** the response returns, **Then** the same logout flow runs (no regression).
- [ ] **Given** I am unauthenticated, **When** I attempt to visit `/profile`, **Then** the `AuthGuard` redirects me to Landing.

### Cross-stack notes
- **FE**: New `src/app/profile/page.tsx` + `src/components/profile-card.tsx` (or inline JSX — keep it simple); minor edit to `src/app/dashboard/page.tsx` to add the View-Profile link; `<AuthGuard>` wraps `/profile` (same pattern as `/dashboard`).
- **BE**: NO new endpoint. `/profile` is a FE-only addition that reads from the existing `GET /users/me`. The existing `POST /auth/logout` serves both Dashboard and Profile.

### Maps to requirements
FR-014 (amended), FR-027, FR-028, FR-029, NFR-A09, NFR-OBS-004 (request_id continuity on the existing /logout endpoint)

---

## Validation

- [x] **Independent** — each story stands alone and can ship without the others
- [x] **Negotiable** — copy + visual placement of the badge / View-Profile link can shift
- [x] **Valuable** — each delivers visible user value
- [x] **Estimable** — XS/S sized; no unknowns after Stage 4
- [x] **Small** — none of these exceed Small effort
- [x] **Testable** — all acceptance criteria are observable

**Count**: 3 stories (target was 3-4 for Feature tier; this fits)
**ACs total**: 16 acceptance criteria (5+5+6)

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T20:05:00+05:30 | AI-DLC | Initial creation. 3 Tier-1 stories (US-009 / US-010 / US-011) covering all 9 new FRs + 3 amendments. |
