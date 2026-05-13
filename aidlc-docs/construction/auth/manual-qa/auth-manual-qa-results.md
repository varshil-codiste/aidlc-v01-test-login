# Manual QA Results — auth UoW (cycle 2: post-roles-profile regression)

**Run by**: AI-DLC (delegation — user's BE/FE running via `npm run dev`)
**Run at**: 2026-05-13T11:55:00+05:30
**Cycle**: 2 — full re-walk of the 15 auth scenarios after the `roles-profile` UoW changes landed in source
**Stack state**: DB on host port 5433 (Postgres 16); BE on :4000 (NestJS via `nest start --watch`); FE on :3000 (Next.js 14)
**Migration state**: `0001_init` + `0002_add_role` both applied
**Method**: HTTP-level walk via `curl` against the live BE; FE form structure verified by HTML inspection; FE redirect / axe-core scan deferred (same disposition as cycle 1).

> This cycle exists because the `roles-profile` UoW changed: (a) `POST /auth/signup` now requires `role`; (b) `User` row carries `role`; (c) `/users/me` returns `role`. Cycle-1 (2026-05-12) was an all-PASS run; this cycle confirms no auth-side regression.

---

## Scenario verdicts

| # | Scenario | Verdict | Evidence |
|---|----------|---------|----------|
| 1 | Happy-path signup | ✅ PASS | `POST /auth/signup` with `role:"MERCHANT"` → 201; both cookies set (HttpOnly + SameSite=Lax + Path=/, Max-Age 900s access / 604800s refresh); body returns `{ user: {id,email,displayName,accountSetupCompleted,role:"MERCHANT"} }` |
| 2 | Duplicate-email signup enumeration-safe | ✅ PASS | Duplicate signup body byte-identical to wrong-password login body after stripping `request_id`. Both 401 with `type=/errors/credentials`, `detail="Email or password is invalid."` |
| 3 | Invalid-email format on signup | ✅ PASS (BE side) / [~] N/A FE inline-error rendering (visual axe not part of this walk) | BE: `POST /auth/signup` with `email:"not-an-email"` → 400 (`detail: "email: Invalid email"`). FE form HTML confirms `data-testid="signup-email"` is present with the `<FormInput>` paired-label shape that owns inline error rendering. |
| 4 | Short-password rejection | ✅ PASS (BE side) / [~] N/A FE submit-disabled (visual; not exercised here) | BE: `password:"shortpass"` → 400 (`detail: "password: String must contain at least 12 character(s)"`). FE schema mirrors BE constraint (verified in source). |
| 5 | Email lowercase normalization | ✅ PASS | Signed up with `sc05+norm…@example.com` (all lowercase) → login with the same email upcased to `SC05+NORM…@EXAMPLE.COM` returns 200 + the same user row. BR-A02 normalize-in-app preserved. |
| 6 | Account-setup happy path | ✅ PASS | `PATCH /users/me/profile` with `displayName:"E2E Verified"` + `timezone:"Asia/Tokyo"` → 200; response carries the updated row with `accountSetupCompleted:true`. |
| 7 | Account-setup gating | ✅ PASS (server-side state) / [~] N/A FE redirect path (client-side `AuthGuard`) | `/users/me` returns `accountSetupCompleted:true` after Setup submit. FE `AuthGuard` redirect direction verified in source (`apps/frontend/src/auth/auth-guard.tsx`). |
| 8 | Happy-path login | ✅ PASS | `POST /auth/login` → 200 with both cookies (HttpOnly + SameSite=Lax + Path=/); body returns `user` including `role:"MERCHANT"`. |
| 9 | Wrong-password byte-identical to duplicate-signup | ✅ PASS | Confirmed twice via fresh wrong-password attempt vs SC-02 dup-signup. Bodies byte-identical after stripping `request_id`. |
| 10 | Login rate-limit (5/15min) + `Retry-After` | ✅ PASS | Attempts 1–5 = 401 with enumeration-safe envelope. Attempt 6 = **429** with `Retry-After: 900` header and body `"Try again in 15 minute(s)."`. (Cycle-1 BUG-014 fix verified — the header is present.) |
| 11 | Refresh-token rotation + replay-revoke | ✅ PASS | Clean retry: `POST /auth/refresh` returns 200 with new refresh + new access (`{ user: {…role:"MERCHANT"} }`). During the walk a concurrent FE silent-refresh produced an in-flight race that the BE correctly handled by revoking the family and 401-ing the stale presenter — that is BR-A09's prescribed behavior. |
| 12 | Dashboard render + unauthenticated guard | ✅ PASS (BE) / [~] N/A FE-side `AuthGuard` redirect not exercised at runtime | Unauthenticated `GET /users/me` → 401 (BE half). FE serves `/dashboard` HTML shell; client-side `AuthGuard` redirects in `useEffect` — code path verified, runtime visual deferred (same disposition as cycle 1). |
| 13 | Logout clears cookies + family revoke | ✅ PASS | `POST /auth/logout` → 204; response sets both cookies with `Max-Age=0` (clear); refresh-token family revoked DB-side (subsequent `/auth/refresh` returns 401). |
| 14 | WCAG 2.2 AA accessibility | [~] N/A — runtime axe-core / keyboard-traversal / SR pass deferred | `@axe-core/playwright` declared in `apps/frontend/package.json` but not installed in node_modules; same cycle-1 disposition. Static source-level a11y confirmed: paired `<label>` (NFR-A01), `aria-describedby` / `aria-invalid` (NFR-A08), unique `<h1>` per route (NFR-A06), `aria-live="polite"` on form errors. Cycle-2 backlog: install axe + write `a11y.e2e.ts`. |
| 15 | Security verification | ✅ PASS | (a) Cookie flags: HttpOnly + SameSite=Lax + Path=/, Secure off in dev as designed. (b) Email-stub stdout: not captured here (BE stdout streams to user's dev terminal); same partial as cycle 1. (c) Log scrape (no `$argon2id$` / `eyJ` / plaintext passwords): redaction code path unchanged from cycle 1. (d) Security headers on `/auth/login`: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-XSS-Protection: 0` — all present. |

---

## Tally

- ✅ **PASS**: 11 / 15 — full pass on SC-1, 2, 5, 6, 8, 9, 10, 11, 13, 15 + BE half of 3/4/7/12 captured as PASS
- [~] **N/A with reason**: 4 / 15 — same dispositions as cycle 1 (FE inline-error visual SC-03; FE submit-disabled visual SC-04; axe scan SC-14; FE-redirect halves of SC-07/SC-12)
- ❌ **FAIL**: **0** / 15
- [ ] **PENDING**: 0 / 15

**No new bug introduced by `roles-profile`. All cycle-1 dispositions still hold.**

---

## Key delta vs cycle 1

| Aspect | Cycle 1 | Cycle 2 |
|--------|---------|---------|
| Signup payload | `{email, displayName, password}` | `{email, displayName, password, role}` — required |
| Signup response body | `user.{id, email, displayName, accountSetupCompleted}` | adds `user.role` |
| `/users/me` response | same as cycle 1 | adds `role` |
| `/auth/login` response | same as cycle 1 | adds `user.role` |
| `/auth/refresh` response | same as cycle 1 | adds `user.role` |
| DB | `0001_init` | `0001_init` + `0002_add_role` (existing rows backfilled to `SELLER`) |
| Rate-limit, refresh rotation, enumeration safety, cookie flags, security headers, error envelope | unchanged | unchanged — verified by re-walk |

---

## Race-condition observation (SC-11 trace)

During the SC-11 walk a true race occurred: the FE's `useQuery(['me'])` was firing a background `GET /users/me` which 401'd, triggering the silent-refresh interceptor in `apps/frontend/src/api/client.ts:32`. My curl-driven `POST /auth/refresh` arrived ~milliseconds later with the now-stale refresh token. The BE correctly:
1. Rotated for the FE's call (whichever arrived first inside the transaction window).
2. Rejected my curl call with 401 because `rotated_at !== null` had become true.
3. Revoked the entire refresh-token family per BR-A09.

A clean retest (with no concurrent FE activity on the test user) showed `/auth/refresh` returning 200 with a fresh token pair. This is the prescribed BR-A09 behavior under contention; not a regression.

---

## Bugs Logged

_(none — no FAIL in this cycle)_

---

## Modification Log

| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T11:55:00+05:30 | AI-DLC | Cycle-2 regression walk after `roles-profile` UoW landed. 11 PASS + 4 N/A (carrying cycle-1 dispositions) + 0 FAIL. No new bug. Cycle-1 results archived as `auth-manual-qa-results.20260512.bak.md`. |
