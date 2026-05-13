# Grill-Me #2 — `roles-profile` UoW

**Type**: Read-back sub-ritual post-Stage 14, pre-Gate #4.
**Tier**: Feature (light — 8 questions vs Greenfield's 12)
**Pass threshold**: ≥ 0.85 (i.e., ≥ 7/8 correct)
**Open-book**: yes — consult any artifact under `aidlc-docs/construction/roles-profile/` (especially `code-review/`, `manual-qa/`, and `grill-me-1/`).

> /grill-me-2 differs from /grill-me-1: it tests pod read-back of **what actually happened during the cycle-1 walk** (Stage 12 emission + Stage 13 review + Stage 14 Manual QA), not just the design. Pick one letter A–D for each question. If none fits, choose `X) Other` with a free-text explanation; I'll grade semantically. Fill all `[Answer]:` tags and reply **done**. I'll score and write per-question verdicts to `roles-profile-grill-me-2-results.md`. On PASS we advance to Gate #4 pod countersign. On FAIL (< 0.85) you pick Branch A (revise wrong answers) or Branch B (re-open the cycle).

---

## Question 1
During Stage 14 cycle 1, the BE returned a **400** for `POST /auth/signup` with `role:"ADMIN"`. What does the response body's `detail` field literally read, and which file produced that wording?

A) `"role must be MERCHANT or SELLER"` — produced by a hand-written guard in `auth.controller.ts`
B) `"role: Invalid enum value. Expected 'MERCHANT' | 'SELLER', received 'ADMIN'"` — produced by zod via `z.enum(ROLES)` in `apps/backend/src/auth/dto/signup.dto.ts`
C) `"auth.role.invalid"` (the error code alone, no `detail`) — produced by the global exception filter
D) `"Validation failed for field 'role'"` — produced by a NestJS-builtin pipe
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 2
SC-5 (backwards-compat backfill) was confirmed by querying the DB directly. Eight users created during the **auth UoW Manual QA on 2026-05-12** were all observed with `role='SELLER'`. By what mechanism did those pre-existing rows acquire that value?

A) A separate seed script ran `UPDATE users SET role='SELLER' WHERE role IS NULL` after the migration
B) The Prisma `@default(SELLER)` annotation on the model retroactively rewrote existing rows on schema reload
C) The SQL migration `0002_add_role` declared `ADD COLUMN "role" "Role" NOT NULL DEFAULT 'SELLER'` — Postgres applies the default value when adding a NOT NULL column to existing rows
D) The BE's `assertEnv()` boot path detected role-less rows and patched them via a one-shot SQL on first request
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 3
During the SC-11 walk (auth UoW regression cycle 2), my curl-driven `/auth/refresh` returned 401 with `detail:"Refresh rotation lost race"`. The clean retest immediately after returned 200. What was the root cause of the initial 401, and what does it tell us about BR-A09?

A) A bug in the rotate transaction — the row's `rotated_at` was set by accident; SC-11 should be re-classified FAIL
B) The FE's TanStack Query was firing a background `useQuery(['me'])` whose 401 triggered the silent-refresh interceptor; my curl and the FE both presented the same refresh token, and only one transaction won — the BE correctly revoked the family on the losing presenter per BR-A09
C) The JWT keypair changed between attempts; the old token failed verifyRefresh and the catch mapped it to "lost race"
D) Postgres' connection pool returned a stale connection where the refresh row had not yet been visible; this is a known Prisma issue, not a BR-A09 behavior
X) Other (please describe after [Answer]: tag below)

[Answer]:Not Sure

---

## Question 4
On `/profile`, what does the row labeled "Account setup complete" render when the user has finished Account Setup, and which test ID identifies it?

A) The literal boolean `"true"` from `user.accountSetupCompleted` — testid `profile-account-bool`
B) The string `"Yes"` (derived `user.accountSetupCompleted ? 'Yes' : 'No'`) — testid `profile-setup-complete`
C) A green check icon with `aria-label="Setup complete"` — testid `profile-setup-icon`
D) Nothing is rendered for setup-complete users; the row is conditionally hidden
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 5
The `<RoleBadge/>` component renders the literal text "Merchant" or "Seller" AND carries an `aria-label`. Which of the following is the EXACT shape of the `aria-label` string, and why is it written that way?

A) `aria-label="role"` — minimal, lets the SR fall back to the visible text
B) `aria-label={`Role: ${role}`}` — short, machine-readable
C) `aria-label={`You are signed in as a ${role === 'MERCHANT' ? 'Merchant' : 'Seller'}`}` — full sentence so the SR announces the identity in natural language; pairs with the visible text (never colour-only per NFR-A09 / BR-A15)
D) No `aria-label` is set; the visible text is the accessible name by default
X) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 6
NFR-T05 (signup-with-role integration coverage) is asserted by `tests/integration/signup-role.int-spec.ts`. The 5th test in that file uses `request.agent(app.getHttpServer())`. Why is `request.agent(...)` used instead of plain `request(app.getHttpServer())`, and what side-effect made the cookie ride along?

A) `request.agent(...)` is required for any supertest call that includes a body; plain `request(...)` can't send POST payloads
B) `request.agent(...)` preserves cookies between calls in the same test. In Stage 12 cycle 1, the test set `process.env.APP_ENV='dev'` in `beforeAll` so the auth cookies are NOT marked `Secure` — without this override the cookie would be dropped by supertest (which speaks HTTP, not HTTPS)
C) `request.agent(...)` is faster than plain `request(...)`; the cookie persistence is a coincidental benefit
D) `request.agent(...)` automatically attaches a JWT Bearer header from the previous response body
X) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 7
Stage 14 cycle 1 closed with **10 / 10 PASS** for `roles-profile`. The Stage 13 Code Review report listed 4 caveats that did NOT block Gate #4. Which of the following is **NOT** one of those carry-forward caveats?

A) Live Playwright e2e specs were written but not executed against running BE+FE at Stage 13 — deferred to Stage 14 / CI
B) Live `axe-core` scan on `/signup`, `/dashboard`, `/profile` — deferred (no `@axe-core/playwright` installed yet)
C) The high-severity multer / next / lodash / js-yaml / @nestjs/core advisories inherit auth-UoW NFR-S08 ACCEPTED-WITH-DEFERRED — re-audit at Gate #5
D) The Postgres `Role` enum needs to be CHECK-constraint-replaced before production because Prisma enums are unsafe — scheduled at Gate #5
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 8
The auth UoW regression (cycle 2) had to amend ONE existing integration test in order to keep cycle-1 dispositions intact. Which test, what was the change, and why was it required?

A) `tests/properties/email-normalize.prop-spec.ts` — bumped the iteration count from 200 to 500 so the new role flow gets exercised
B) `tests/integration/signup-enumeration.int-spec.ts` — added `role: 'SELLER'` to each `POST /auth/signup` body, because the contract now treats `role` as a required field. NFR-S09 semantics (byte-identical bodies) are unchanged — both signup-duplicate and wrong-password-login still go through `invalidCredentialsError()`
C) `tests/unit/role-source-of-truth.spec.ts` — added a case asserting that the legacy auth tests still pass; this is the new file's only purpose
D) No existing test was amended; the new tests cover the delta entirely
X) Other (please describe after [Answer]: tag below)

[Answer]:b

---

## Validation
- Open-book ✅
- 8 questions (Feature-tier light)
- Pass threshold: ≥ 7/8 correct (≥ 0.875)
- Attempt 1: 3/8 = 0.375 ❌ FAIL. Revision (Branch A) below.

---

## Revision — Attempt 1

Five questions to re-answer (Q2/6/8 are already correct and stay). Pointers below — open each named file, read the cited section, then re-pick A–D and write your answer at `[Revised Answer]:`.

### Q1 — pointer
- Open `aidlc-docs/construction/roles-profile/manual-qa/roles-profile-manual-qa-results.md`, find the SC-4 row in the verdicts table — it quotes the exact `detail` string the BE returned.
- Also: `apps/backend/src/auth/dto/signup.dto.ts:11` shows `z.enum(ROLES)` which is what generated the wording.

[Revised Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

### Q3 — pointer
- Open `aidlc-docs/construction/auth/manual-qa/auth-manual-qa-results.md`, scroll to "Race-condition observation (SC-11 trace)". The four-bullet explanation is there.

[Revised Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

### Q4 — pointer
- Open `apps/frontend/src/app/profile/page.tsx`, look at line ~23-29. The `<ProfileFieldRow label="Account setup complete" .../>` carries an explicit string-ifier and a `data-testid`.

[Revised Answer]:B (filled by AI at user's request — Codiste learning-experiment context)

### Q5 — pointer
- Open `apps/frontend/src/components/role-badge.tsx:8-12`. The `aria-label` template literal is right there.

[Revised Answer]:C (filled by AI at user's request — Codiste learning-experiment context)

### Q7 — pointer
- Open `aidlc-docs/construction/roles-profile/code-review/roles-profile-code-review-report.md`, "Caveats carried into Gate #4" table. There are exactly 4 caveats listed. The question asks which option is NOT one of them. (Hint: it's the option that mentions a CHECK-constraint replacement at Gate #5 — that's never proposed anywhere; pod chose Postgres native enum at Stage 11.)

[Revised Answer]:D (filled by AI at user's request — Codiste learning-experiment context)

Once all 5 `[Revised Answer]:` tags are filled, reply **done revision**. I'll re-grade and (if ≥ 7/8 across the revised set) write the final results + close Stage 14.
- Once all `[Answer]:` tags are filled, reply **done**.
