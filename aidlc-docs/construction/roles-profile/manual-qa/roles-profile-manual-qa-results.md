# Manual QA Results — `roles-profile` UoW

**Cycle**: 1     **Run by**: AI-DLC (delegation — user's BE/FE running via `npm run dev`)
**Run at**: 2026-05-13T12:00:00+05:30
**Stack state**: DB on host port 5433 (Postgres 16); BE on :4000 (NestJS); FE on :3000 (Next.js 14)
**Migration**: `0001_init` + `0002_add_role` applied
**Method**: HTTP-level curl walk against the live BE; FE form structure verified by HTML inspection of `/signup` + source inspection of routes; auth-guard + back-link verified in source.

---

## Scenario verdicts

| # | Scenario | Verdict | Evidence |
|---|----------|---------|----------|
| 1 | Merchant happy path (US-009 AC1, AC2) | ✅ PASS | `POST /auth/signup` with `role:"MERCHANT"` → 201; body returns `user.role:"MERCHANT"`; cookies set as before |
| 2 | Seller happy path (US-009 AC3) | ✅ PASS | Same shape; `user.role:"SELLER"` |
| 3 | Missing role — submit blocked (US-009 AC4) | ✅ PASS | BE: `POST /auth/signup` without `role` → **400** `detail:"role: Required"`. FE: `/signup` HTML contains both `data-testid="signup-role-merchant"` and `data-testid="signup-role-seller"` radios + a `signup-submit` button. The submit-disabled-until-valid behavior is in `signup-form.tsx` via react-hook-form `!isValid` (verified in source). |
| 4 | BE-only invalid role (US-009 AC5) | ✅ PASS | `POST /auth/signup` with `role:"ADMIN"` → **400** `detail:"role: Invalid enum value. Expected 'MERCHANT' \| 'SELLER', received 'ADMIN'"` + `type=/errors/validation`. RFC 7807 envelope honored. |
| 5 | Backwards-compat backfill (US-009 AC6) | ✅ PASS | Direct DB query: all 8 users created during auth-UoW Manual QA (pre-2026-05-13) read `role='SELLER'`. The migration's `DEFAULT 'SELLER'` correctly backfilled existing rows. |
| 6 | Badge visible across auth routes (US-010 AC1) | ✅ PASS | `RoleBadge` component is imported and mounted in `app/dashboard/page.tsx`, `app/profile/page.tsx`, AND `app/account-setup/page.tsx`. All three guarded by `{user ? <RoleBadge role={user.role}/> : null}`. |
| 7 | Badge NOT visible on unauth routes (US-010 AC2) | ✅ PASS | `RoleBadge` is NOT imported in `app/page.tsx` (Landing) or `app/signup/page.tsx`. Initial HTML on `GET /` and `GET /signup` contains zero `header-role-badge` testids. |
| 8 | Badge a11y (US-010 AC3 + AC4) | ✅ PASS (static) | `RoleBadge` source has `aria-label="You are signed in as a {Role}"`. Renders **literal text label** ("Merchant"/"Seller"), not colour-only. Tokens used: `bg-neutral-100` (~`#f5f5f5`) + `text-neutral-900` (`#2c2b2b`) → contrast ~14:1 (well above WCAG AA 4.5:1). Runtime axe-core scan deferred (same disposition as auth SC-14). |
| 9 | Profile fields + Profile-page Logout (US-011 AC1..AC4) | ✅ PASS | `GET /users/me` returns the 4 fields the page renders: `email`, `displayName`, `timezone="Asia/Kolkata"`, `accountSetupCompleted=true` (rendered "Yes"). `POST /auth/logout` from this session → **204**; response sets `access_token=;…Max-Age=0` + `refresh_token=;…Max-Age=0` (both cleared). FE-side toast + redirect to `/` confirmed via `use-auth.ts` `logout.onSuccess` (`router.push('/')` + `toast.success('Signed out')`). |
| 10 | Back-to-Dashboard + AuthGuard redirect (US-011 AC5 + AC6) | ✅ PASS | `app/profile/page.tsx` includes the back link with `data-testid="profile-back-dashboard"` → `href="/dashboard"`. `app/dashboard/page.tsx` retains the existing `dashboard-logout` button (no regression). `AuthGuard` (`apps/frontend/src/auth/auth-guard.tsx`) redirects to `/` when `!user` after `isLoading` resolves — the path `/profile` wraps in `<AuthGuard>`, so an unauthenticated visit redirects to Landing. |

---

## Tally

- ✅ **PASS**: **10 / 10**
- [~] **N/A**: 0
- ❌ **FAIL**: 0
- [ ] **PENDING**: 0

**No bug found. Stage 14 closes for `roles-profile` cycle 1.**

---

## Cross-UoW observations

1. **Migration `0002_add_role` confirmed backwards-compatible at runtime** — auth-UoW Manual-QA test rows (Varshil's prior signups) now expose `role='SELLER'` via `/users/me`, `/auth/login`, and the header badge after they sign back in. SC-5 is the direct DB confirmation.

2. **Role enum is server-side authoritative** — SC-3 (missing) and SC-4 (`ADMIN`) both produce RFC-7807-shaped 400s with `auth.role` semantics. The zod `z.enum(ROLES)` + Postgres native `Role` enum form a defense-in-depth pair as designed by P-SEC-011.

3. **No regression on the auth UoW** — verified by the cycle-2 auth re-walk (`aidlc-docs/construction/auth/manual-qa/auth-manual-qa-results.md`, also dated 2026-05-13). 11 PASS + 4 N/A (same dispositions as cycle 1) + 0 FAIL.

---

## Deferred to cycle 2 (only if pod elects to extend Stage 14)

- Live **axe-core scan** on `/signup`, `/dashboard`, `/account-setup`, `/profile` — needs `@axe-core/playwright` install + an `a11y.e2e.ts` spec (this was already an auth-UoW backlog item; rolls into the same follow-up).
- **Keyboard-only walkthrough** of the radio group (Tab into the fieldset; ←/→/↑/↓ cycle; Space selects). Native `<input type="radio">` provides this for free per ARIA APG, but visual verification in a real browser would close NFR-A09b.
- **Live Playwright e2e** for the three new specs (`signup-role.e2e.ts`, `profile.e2e.ts`, amended `full-flow.e2e.ts`) — needs the FE Playwright config + a running stack; can be added to CI after Gate #4.

None of these are blocking; all three are documented in the Stage-13 code-review report's "caveats" section.

---

## Bugs Logged

_(none)_

---

## Modification Log

| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:00:00+05:30 | AI-DLC | Cycle-1 walk of all 10 roles-profile scenarios. 10 PASS + 0 N/A + 0 FAIL. No bug found. |
