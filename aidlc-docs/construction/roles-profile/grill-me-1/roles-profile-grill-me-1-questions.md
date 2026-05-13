# Grill-Me #1 — `roles-profile` UoW

**Type**: Read-back sub-ritual post-Stage 9, pre-Stage 10.
**Tier**: Feature (light — 8 questions vs Greenfield's 12)
**Pass threshold**: ≥ 0.85 (i.e., ≥ 7/8 correct)
**Open-book**: yes — consult any artifact under `aidlc-docs/construction/roles-profile/` and the inherited auth artifacts.

> Pick one letter A–D for each question. If none fits, choose `X) Other` and explain — I'll grade your free-text against the ground truth semantically. Fill all `[Answer]:` tags and reply **done**. I'll score and write per-question verdicts to `roles-profile-grill-me-1-results.md`. On PASS we advance to Stage 10. On FAIL (< 0.85) you pick Branch A (revise wrong answers) or Branch B (update FR/NFR and loop back to Stage 8/9).

---

## Question 1
According to **BR-A13** in `roles-profile-business-rules.md`, what does the BE do when a `POST /auth/signup` request arrives with `role: "ADMIN"` (a value outside the enum)?

A) Persists the user with the literal "ADMIN" value; Postgres' enum will reject later at INSERT — the API returns 500
B) Coerces the value to `SELLER` (the default) and proceeds — the API returns 201
C) Rejects at the zod layer with 400 RFC 7807 and code `auth.role.invalid` — no DB write occurs
D) Returns 401 with the byte-identical `auth.credentials.invalid` envelope (enumeration safety)
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 2
According to **BR-A14** in `roles-profile-business-rules.md`, *why* does the migration `0002_add_role` set `DEFAULT 'SELLER'` on the `role` column?

A) Because the BR explicitly allows users to omit `role` at signup — `SELLER` is the silent fallback for new users
B) Solely to satisfy `NOT NULL` for the backfill of pre-existing auth-UoW rows (which had no role); the API contract still treats `role` as a required input at signup
C) To bias the product toward Sellers, since they are the majority Codiste persona
D) To match the Prisma default in `schema.prisma`; the SQL default and the Prisma default carry identical product meaning
X) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 3
According to **NFR-MAINT-003** + **BR-A14**, where is the canonical declaration of the `Role` union (`MERCHANT | SELLER`) that FE, BE, and Prisma must all reference?

A) `apps/backend/src/auth/role.enum.ts` — backend owns the auth domain
B) `apps/frontend/src/types/role.ts` — frontend owns user-visible labels
C) `prisma/schema.prisma` — the database is the source of truth
D) `shared/role.ts` — a workspace-shared file imported by FE and BE; Prisma enum, BE zod, and FE TS union are all kept in sync with it
X) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 4
According to **BR-A15** + **NFR-A09**, on which routes is `<RoleBadge/>` rendered, and on which is it NOT rendered?

A) Rendered on every route (including `/`, `/signup`); on unauth pages it shows "Guest"
B) Rendered only on `/profile` (since that is the dedicated profile destination); not on `/dashboard` or `/account-setup`
C) Rendered on every authenticated route (`/dashboard`, `/account-setup`, `/profile`) next to `display_name`; NOT rendered on Landing or `/signup`
D) Rendered on `/dashboard` only; the badge is mutually exclusive with the `/profile` page's heading
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 5
According to **NFR-A09**, which accessibility properties does the `<RoleBadge/>` need to satisfy? (pick the most complete answer)

A) `aria-hidden="true"` so screen readers skip it (it's purely decorative)
B) Colour-only role indication is acceptable because the badge is small and decorative
C) `aria-label="You are signed in as a {Role}"`, contrast ≥ 4.5:1 against the header surface, and the role text label is always present (NOT colour-only)
D) `role="alert"` so screen readers announce it on every page transition
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 6
According to **BR-A16**, where on the `/profile` page does the user go to log out, and what backend endpoint is hit?

A) A Logout button in the header that hits `DELETE /users/me`
B) A Logout button on the Profile page (data-testid `profile-logout`) which hits the existing `POST /auth/logout` (BR-A09 family revoke + cookie clear) — same flow that the Dashboard logout uses
C) A "Sign Out" link in the footer that calls `GET /auth/logout?return_to=/`
D) There is no Profile-page logout; the user must navigate back to `/dashboard` to log out
X) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 7
According to **NFR-T05**, what evidence proves that role validation actually works at the BE in this UoW?

A) A static lint rule on the zod schema (no runtime test required because the schema is the source of truth)
B) A property-based test in `tests/properties/role.prop-spec.ts` checks that round-tripping a role string is idempotent
C) A dedicated integration spec `tests/integration/signup-role.int-spec.ts` runs against the real Postgres (no mocks), asserting: 201 for a valid signup; 400 for missing role; 400 for invalid role string; the persisted row's role reads back as sent
D) Manual QA only — automated coverage is deferred to a follow-up UoW
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 8
A user who existed *before* the `roles-profile` UoW landed (i.e., they signed up during auth UoW Stage 14 Manual QA) logs in for the first time after migration `0002_add_role` has been applied. According to US-009 AC6 + BR-A14, what does the `user.role` field read on the response from `POST /auth/login`?

A) `null` — the user has not selected a role yet; FE must prompt them on next page load
B) `MERCHANT` — Merchant is the more-privileged default for backwards-compat
C) `SELLER` — Postgres backfilled the pre-existing row with the column default `SELLER`; the user can be migrated later if business needs it, but the API contract returns whatever is in the row
D) The login fails with 409 — the BE requires a role and refuses to issue tokens for a role-less user
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Validation
- Open-book ✅
- 8 questions (Feature-tier light)
- Pass threshold: ≥ 7/8 correct (≥ 0.875)
- Once all `[Answer]:` tags are filled, reply **done**.
