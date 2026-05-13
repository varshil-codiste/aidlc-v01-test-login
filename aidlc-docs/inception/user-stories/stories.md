# User Stories

**Tier**: Greenfield
**Stories**: 8 (6 Tier-1 + 2 Tier-2)
**Style**: INVEST + Given-When-Then; ordered by user journey.
**Generated**: 2026-05-12T00:09:00Z

---

## Story US-001 — Sign up with email + password

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: S
**Journey phase**: Register

**As a** Codiste teammate visiting the sandbox for the first time,
**I want** to create an account using my email and a password,
**so that** I have a personal identity to sign back in with later.

### Acceptance Criteria
- [ ] **Given** I am on the Landing screen and have no account, **When** I click the "Sign Up" CTA on the left brand panel, **Then** I land on a Signup form with three fields: `email`, `display_name`, `password`.
- [ ] **Given** I fill the Signup form with a valid email, a display_name, and a password of length ≥ 12, **When** I submit, **Then** the API returns 201, both `access_token` and `refresh_token` cookies are set (HttpOnly, Secure, SameSite=Lax), and I am redirected to the Account Setup screen.
- [ ] **Given** I submit a Signup with an email already registered, **When** the API responds, **Then** the response is **identical in body and status** to the "wrong password on login" response (NFR-S09 — no enumeration).
- [ ] **Given** my Signup is accepted, **When** I inspect stdout, **Then** I see a single JSON line `{to, subject, body, verificationToken}` AND the user row has `verified=true` immediately (B4=A stub).
- [ ] **Given** I submit a Signup with an invalid email or a password < 12 chars, **When** I attempt to submit, **Then** the submit button is disabled AND an inline error explains the violation.

### Cross-stack notes (full-stack)
- **FE**: Signup form component; client-side validation (visual only); cookie set is server-driven; redirect to `/account-setup` on success.
- **BE**: `POST /auth/signup` endpoint; Argon2id hash; insert into `users`; emit verification JSON to stdout; auto-mark verified; set cookies; return 201 + sanitized user record.
- **DB**: `users` table with columns `id (uuid)`, `email (unique)`, `display_name`, `password_hash`, `verified`, `account_setup_completed`, `created_at`.

### Maps to requirements
FR-001, FR-002, FR-003, FR-004, FR-005, NFR-S01, NFR-S06, NFR-S09, NFR-A01, NFR-A04, NFR-A08, NFR-T01

---

## Story US-002 — Complete account setup

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: XS
**Journey phase**: Setup (immediately post-signup)

**As a** newly signed-up teammate,
**I want** to confirm my display name and pick my timezone in a one-screen form,
**so that** my account is fully ready and I can land on the Dashboard.

### Acceptance Criteria
- [ ] **Given** I just signed up (US-001) and `account_setup_completed=false`, **When** I arrive at `/account-setup`, **Then** I see two fields: `display_name` (pre-filled from signup) and `timezone` (dropdown of IANA names, default = `Asia/Kolkata`).
- [ ] **Given** I submit Account Setup with both fields valid, **When** the API responds 200, **Then** the user row is updated, `account_setup_completed=true`, and I am redirected to the Dashboard.
- [ ] **Given** I am logged in but `account_setup_completed=false`, **When** I navigate to any non-setup route (e.g. `/dashboard`), **Then** I am redirected back to `/account-setup`.
- [ ] **Given** I have already completed setup, **When** I attempt to visit `/account-setup`, **Then** I am redirected to `/dashboard`.

### Cross-stack notes
- **FE**: Account-setup page component; reads pre-filled display_name from BE; submit posts to BE.
- **BE**: `PATCH /users/me/profile` endpoint; auth-required; updates `display_name`, `timezone`, sets `account_setup_completed=true`.
- **Middleware**: Route guard that checks `account_setup_completed` and redirects accordingly.

### Maps to requirements
FR-011, FR-012, FR-013, NFR-A01, NFR-A05

---

## Story US-003 — Log in with existing credentials

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: S
**Journey phase**: Use (returning user)

**As a** teammate who already signed up,
**I want** to log in with my email + password from the Landing screen,
**so that** I can pick up where I left off.

### Acceptance Criteria
- [ ] **Given** I am on the Landing screen and have a verified account, **When** I enter my email + password in the right-side Sign In form and click "Sign In", **Then** the API returns 200, both auth cookies are set with refresh-token rotation enabled, and I am redirected to `/dashboard` (assuming `account_setup_completed=true`).
- [ ] **Given** my password is wrong, **When** I submit, **Then** the response is the **same generic "email or password invalid"** message as the duplicate-signup case (NFR-S09).
- [ ] **Given** my access token expires (15 min), **When** my next request reaches the BE, **Then** the FE silently uses the refresh token to obtain a new access token AND the old refresh token is immediately invalidated.
- [ ] **Given** the refresh-token rotation flow runs N times, **When** I present any old refresh token (replay), **Then** the entire session family is revoked and I am forced to re-login.

### Cross-stack notes
- **FE**: Sign In form (already in Figma at frames 1:23 et seq.); cookie-based session means FE never reads tokens; silent refresh is an HTTP-interceptor pattern.
- **BE**: `POST /auth/login` + `POST /auth/refresh` endpoints; verify Argon2id hash; issue RS256 JWTs; track refresh-token families in DB.
- **DB**: `refresh_tokens` table with `id`, `user_id`, `family_id`, `token_hash`, `rotated_at`, `revoked`.

### Maps to requirements
FR-006, FR-007, FR-008, FR-009, NFR-S02, NFR-S03, NFR-S10, NFR-A01, NFR-A02

---

## Story US-004 — View Dashboard

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: XS
**Journey phase**: Use

**As a** logged-in teammate whose account setup is complete,
**I want** to see a Dashboard that greets me by name,
**so that** I have visual confirmation I'm signed in.

### Acceptance Criteria
- [ ] **Given** I am authenticated and setup-completed, **When** I visit `/dashboard`, **Then** I see "Hello, {display_name}" and a Logout button — nothing else (v1 thin slice per BR § 1.4).
- [ ] **Given** my auth cookie is missing or invalid, **When** I attempt to visit `/dashboard`, **Then** I am redirected to Landing (HTTP 302 from BE, route guard from FE).
- [ ] **Given** I am on the Dashboard, **When** screen-reader pressed `<h1>`, **Then** the heading announces "Dashboard — Hello, {display_name}".

### Cross-stack notes
- **FE**: Dashboard page; reads `display_name` from `/users/me`; renders greeting + Logout button.
- **BE**: `GET /users/me` endpoint; returns sanitized user record (no password fields).

### Maps to requirements
FR-014, NFR-A05, NFR-A06, NFR-S03

---

## Story US-005 — Log out

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: XS
**Journey phase**: Leave

**As a** signed-in teammate,
**I want** to click Logout and return to the Landing page,
**so that** I can hand the laptop to a colleague without leaving my session open.

### Acceptance Criteria
- [ ] **Given** I am on the Dashboard, **When** I click "Logout", **Then** the BE invalidates my refresh-token family AND clears both cookies via `Set-Cookie: Max-Age=0`.
- [ ] **Given** the logout response returns, **When** the FE finishes, **Then** I see the Landing screen with a transient toast "Signed out" visible for ~5 seconds.
- [ ] **Given** I press the browser's Back button after logout, **When** I attempt to visit `/dashboard`, **Then** I am redirected to Landing (cookies are cleared).

### Cross-stack notes
- **FE**: Logout button; on click → `POST /auth/logout` → render Landing with toast.
- **BE**: `POST /auth/logout` endpoint; clears cookies; revokes the current refresh-token family in DB.

### Maps to requirements
FR-015, NFR-S03, NFR-S10, NFR-A03

---

## Story US-006 — See validation, enumeration-safe, and rate-limit errors

**Persona**: CodisteTeammate
**Tier**: 1 — MVP critical
**Effort**: M
**Journey phase**: Use (cross-cutting — error handling)

**As a** teammate who occasionally makes mistakes or whose laptop sometimes flakes,
**I want** inline, accessible, enumeration-safe, and consistent error messages,
**so that** I know what to fix without leaking information about other accounts.

### Acceptance Criteria
- [ ] **Given** I submit an invalid email format anywhere, **When** the FE validates, **Then** an inline error renders below the field via `aria-describedby` + `aria-live="polite"`, AND the submit button is disabled until the error clears.
- [ ] **Given** I submit a password < 12 chars, **When** the FE validates, **Then** an inline error explains "Password must be at least 12 characters" and the submit button is disabled.
- [ ] **Given** I attempt 5 failed logins for the same email within 15 minutes, **When** I make the 6th attempt, **Then** the BE returns HTTP 429 with `Retry-After` header AND the FE shows "Too many attempts. Try again in N minutes."
- [ ] **Given** the rate-limit window expires, **When** I try again, **Then** I am allowed to attempt again normally.
- [ ] **Given** a duplicate-signup or wrong-password error renders, **When** I diff the responses, **Then** they are **byte-identical** in the response body (NFR-S09) — only the status code may differ if necessary.
- [ ] **Given** any error renders, **When** the page is inspected, **Then** the error uses the provisional `danger` color (`#dc2626`) AND a leading error icon (not color-only).

### Cross-stack notes
- **FE**: Centralized error-handling utility; `<FormError aria-live="polite">` component; rate-limit countdown UI.
- **BE**: Validation via schema library (zod/pydantic — per Stage 11); rate-limit middleware on `/auth/login` (5 attempts / 15 min / per email); identical error envelopes for enumeration-safe cases.

### Maps to requirements
FR-005, FR-009, FR-010, FR-019, NFR-S04, NFR-S06, NFR-S09, NFR-A03, NFR-A08, NFR-U02, NFR-U03

---

## Story US-007 — Accessibility audit (WCAG 2.2 AA)

**Persona**: CodisteTeammate (auditor role — the same human running an a11y pass)
**Tier**: 2 — verification (cross-cutting)
**Effort**: S
**Journey phase**: Cross-cutting verification (runs at Stage 14 Manual QA)

**As a** teammate verifying that the WCAG 2.2 AA extension actually fires,
**I want** the Manual-QA checklist to include a concrete a11y pass that I execute,
**so that** I can attest to AA compliance with no automated-test substitute.

### Acceptance Criteria
- [ ] **Given** the implementation is built, **When** I run `axe-core` against the Landing, Signup, Account-Setup, Dashboard routes, **Then** zero violations of "serious" or "critical" severity remain.
- [ ] **Given** I navigate the entire flow with keyboard only (no mouse), **When** I traverse Landing → Sign Up → Account Setup → Dashboard → Logout, **Then** every interactive element is reachable, the Tab order matches visual order, and focus indicators are visible at every step.
- [ ] **Given** I run a color-contrast inspector on each token combination used in production, **When** I check body text, **Then** every combination passes AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text). **Including** the previously-flagged `#908d8d` subtitle which must be darkened to ≥ 4.5:1 OR used only for large/non-body text.
- [ ] **Given** a screen reader (NVDA / VoiceOver) reads the page, **When** I navigate by heading, **Then** each route has a unique `<h1>` that describes the page purpose AND form errors are announced via the live region.

### Cross-stack notes
- **FE**: Use semantic HTML; pair every input with a `<label>`; provide visible focus styles.
- **Tooling**: `@axe-core/playwright` in E2E suite; manual screen-reader pass during Stage 14 Manual QA.

### Maps to requirements
NFR-A01, NFR-A02, NFR-A03, NFR-A04, NFR-A05, NFR-A06, NFR-A07, NFR-A08

---

## Story US-008 — Security audit (auth-flow & PBT invariants)

**Persona**: CodisteTeammate (auditor role)
**Tier**: 2 — verification (cross-cutting)
**Effort**: M
**Journey phase**: Cross-cutting verification (runs at Stage 14 Manual QA + Stage 13 Code Review)

**As a** teammate verifying the security baseline + PBT extensions actually fire,
**I want** automated property-based tests for the four invariants plus an integration check of every NFR-S0x rule,
**so that** Gate #4 cannot be signed unless the security guarantees hold.

### Acceptance Criteria
- [ ] **Given** the BE test suite runs, **When** `fast-check` (or `hypothesis` / `gopter`) executes the password-hash round-trip property, **Then** for any password of length ≥ 12 the property `verify(hash(p)) === true` holds across 100+ random inputs.
- [ ] **Given** the BE test suite runs, **When** the JWT round-trip property executes, **Then** for any valid claims object, `verify(sign(claims)) === claims` (modulo standard JOSE-added fields).
- [ ] **Given** the BE test suite runs, **When** the email-normalization idempotence property executes, **Then** `normalize(normalize(e)) === normalize(e)` for any reasonable email string.
- [ ] **Given** the BE test suite runs, **When** the refresh-token rotation property executes, **Then** rotating N times yields N+1 distinct tokens AND only the most recent is valid AND any replay revokes the family.
- [ ] **Given** the integration suite runs, **When** I assert response headers on `/login` and `/signup` responses, **Then** all required Security headers are present (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- [ ] **Given** I scan dependencies with `npm audit --omit=dev` / `pip-audit`, **When** the scan completes, **Then** zero `high` or `critical` vulnerabilities are present.
- [ ] **Given** I scrape integration-test logs, **When** I grep for plaintext passwords or full JWTs, **Then** zero matches are found.

### Cross-stack notes
- **BE**: Property-based test files (`tests/properties/*.spec.ts` or equivalent); integration test suite covers headers + log shape.
- **CI**: `npm audit` / `pip-audit` step is a Stage 13 PROCEED prerequisite.
- **FE**: Browser DevTools "Cookies" panel manual check during Stage 14 Manual QA (HttpOnly + Secure flags visible).

### Maps to requirements
NFR-S01, NFR-S02, NFR-S03, NFR-S04, NFR-S05, NFR-S06, NFR-S07, NFR-S08, NFR-S09, NFR-S10, NFR-T01, NFR-T02, NFR-T03, NFR-T04, NFR-T06
