# Manual QA — `roles-profile` UoW (Stage 14)

**Cycle**: 1     **Run by**: Pod (Varshil running)     **Generated**: 2026-05-13T11:10:00+05:30
**Tier**: Feature (light) — 10 scenarios across US-009 + US-010 + US-011

---

## Pre-flight

### Bring up the stack
DB is already up on host port 5433 (`auth-db` container). Migration `0002_add_role` has been applied. Bring up the rest:

```bash
# from the workspace root
docker compose up -d db                     # confirms DB running (idempotent if already up)

# Backend on :4000
cd apps/backend
DATABASE_URL="postgresql://app:app@localhost:5433/auth" \
  JWT_PRIVATE_KEY="$(cat ../../scripts/keys/private.pem 2>/dev/null || echo 'GEN_FIRST')" \
  JWT_PUBLIC_KEY="$(cat ../../scripts/keys/public.pem 2>/dev/null || echo 'GEN_FIRST')" \
  APP_ENV=dev FE_ORIGIN=http://localhost:3000 \
  npm run start:dev

# Frontend on :3000  (new terminal)
cd apps/frontend
npm run dev
```

If `scripts/keys/private.pem` is missing, run `bash scripts/gen-keys.sh` once first.

Open the app at **http://localhost:3000**.

### Tip — clear DB rows between runs
Because email is UNIQUE, a re-run with the same email fails on signup-duplicate. Use a fresh email per attempt (`merchant1+<n>@example.com`) or `docker compose down -v && docker compose up -d db && npx prisma migrate deploy` to wipe.

---

## Scenarios

### US-009 — Sign up as a Merchant or Seller

#### Scenario 1 — Merchant happy path  (AC1, AC2)
- [ ] Visit `/signup`.
- [ ] Confirm: the form shows an "I am a…" group with two radios "Merchant" and "Seller".
- [ ] Confirm: the **Create account** button is **disabled** until a role is chosen.
- [ ] Fill `email = qa+merchant<N>@example.com`, `display name = QA Merchant`, `password = CorrectHorseBattery42!`.
- [ ] Confirm: button is still disabled before picking a role.
- [ ] Pick **Merchant**. Confirm: button becomes enabled.
- [ ] Click **Create account**.
- [ ] Expect: redirect to `/account-setup`; URL contains `account-setup`; the header now shows **Merchant** badge.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 2 — Seller happy path  (AC3)
- [ ] Sign out (or open a private window).
- [ ] Visit `/signup`.
- [ ] Fill a different email, e.g. `qa+seller<N>@example.com`.
- [ ] Pick **Seller**. Submit.
- [ ] Expect: `/account-setup`; header badge says **Seller**.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 3 — Missing role — submit blocked  (AC4)
- [ ] Visit `/signup`.
- [ ] Fill email + display name + a ≥12-char password.
- [ ] Do NOT pick a role.
- [ ] Confirm: **Create account** is disabled. Try clicking it — nothing happens.
- [ ] (Optional) Inline error appears under the radio group when you tab out without picking ("Please select a role…").
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 4 — Backend-only invalid role (curl)  (AC5)
- [ ] In a terminal:
```bash
curl -i -X POST http://localhost:4000/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"qa+bad<N>@example.com","displayName":"BadRole","password":"CorrectHorseBattery42!","role":"ADMIN"}'
```
- [ ] Expect: `HTTP/1.1 400`; body is `application/problem+json` with `type` containing "validation".
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 5 — Backwards-compat backfill  (AC6)
- [ ] Pick an email that already existed in the DB from auth UoW Manual QA (or any pre-migration row). If none, skip with N/A.
- [ ] Log in.
- [ ] Open DevTools → Network → click the login row → response body → confirm `user.role === "SELLER"`. Alternatively visit `/profile` and confirm the header badge says **Seller**.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

---

### US-010 — Role badge in the authenticated header

#### Scenario 6 — Badge visible across all auth routes  (AC1)
- [ ] Sign in as a Merchant.
- [ ] Confirm the header badge **Merchant** is visible on `/dashboard`.
- [ ] Navigate to `/account-setup` (you may need to use a fresh signup if you've completed setup). Confirm badge visible.
- [ ] Navigate to `/profile`. Confirm badge visible.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 7 — Badge NOT visible on unauth routes  (AC2)
- [ ] Log out (or use a private window).
- [ ] Visit `/` — confirm **no** badge.
- [ ] Visit `/signup` — confirm **no** badge.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 8 — Badge a11y: screen reader / aria-label + contrast  (AC3 + AC4)
- [ ] With a logged-in user, inspect the badge in DevTools → confirm it has `aria-label="You are signed in as a Merchant"` (or Seller).
- [ ] Run axe-core (DevTools axe panel, or `npx @axe-core/cli http://localhost:3000/dashboard`) — confirm **no serious/critical findings**.
- [ ] (Visual) The badge text is "Merchant" or "Seller" — not a color-only indicator.
- [ ] **Verdict**: __ PASS / FAIL / N/A __

---

### US-011 — Profile page + Logout

#### Scenario 9 — Dashboard → Profile → fields read, then Profile-page Logout  (AC1, AC2, AC3, AC4)
- [ ] On `/dashboard`, locate and click **View Profile** (`data-testid="dashboard-view-profile"`).
- [ ] Expect URL `/profile`.
- [ ] Confirm 4 read-only field rows are present:
  - [ ] Email (`profile-email`)
  - [ ] Display name (`profile-display-name`)
  - [ ] Timezone (`profile-timezone`)
  - [ ] Account setup complete (`profile-setup-complete`) — value is exactly "Yes" or "No"
- [ ] Click **Logout** on the Profile page (`profile-logout`).
- [ ] Expect: redirected to `/`, the "Signed out" toast appears (~5 s), and `document.cookie` no longer carries `access_token`/`refresh_token` (use DevTools → Application → Cookies to confirm).
- [ ] **Verdict**: __ PASS / FAIL / N/A __

#### Scenario 10 — Back-to-Dashboard + AuthGuard redirect on `/profile` when unauth  (AC5 + AC6)
- [ ] Sign in fresh; go to `/dashboard` → click "View Profile".
- [ ] Click **Back to Dashboard** (`profile-back-dashboard`). Confirm URL becomes `/dashboard`. No regression of the Dashboard logout (US-005).
- [ ] Click the Dashboard's existing **Logout**. Confirm `/`. (regression of US-005)
- [ ] In a private/incognito window, visit `/profile` directly. Expect redirect to `/` (Landing).
- [ ] **Verdict**: __ PASS / FAIL / N/A __

---

## Result tracker
Tick each scenario above. Fill the table below as you go:

| # | Scenario | Verdict |
|---|----------|---------|
| 1 | Merchant happy path | __ |
| 2 | Seller happy path | __ |
| 3 | Missing role — submit blocked | __ |
| 4 | BE-only invalid role (curl) | __ |
| 5 | Backwards-compat backfill | __ |
| 6 | Badge visible across auth routes | __ |
| 7 | Badge NOT visible on unauth routes | __ |
| 8 | Badge a11y (aria-label + axe + not-colour-only) | __ |
| 9 | Profile page fields + Profile-page Logout | __ |
| 10 | Back-to-Dashboard + AuthGuard redirect | __ |

**Tallies**: __ PASS    __ FAIL    __ N/A     of 10.

---

## Bug log (file any FAIL or surprise here)

| BUG-ID | Scenario | Severity | Description | Resolution |
|--------|----------|----------|-------------|------------|
| _(none yet)_ | | | | |

The bug-loop discipline from the auth cycle 1 still applies: max 3 cycles; each surfaced bug must be fixed-in-source OR explicitly ACCEPTED-WITH-DEFERRED-REMEDIATION before Gate #4. If everything is green I write `roles-profile-manual-qa-results.md` and we move to /grill-me-2 → Gate #4 countersign.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T11:10:00+05:30 | AI-DLC | Cycle 1 — 10-scenario checklist; pod walking it from FE :3000. |
