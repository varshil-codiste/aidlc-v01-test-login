# Business Requirements — `roles-profile` UoW

**UoW**: `roles-profile`     **Tier (proposed)**: Feature
**Generated**: 2026-05-12T19:40:00+05:30
**Built on top of**: `auth` UoW (login + account-setup) — see `aidlc-docs/construction/auth/`
**Instructions**: Answer each `[Answer]:` tag with a single letter, or pick `X)` and write your own answer after the tag. Reply `done` in chat when all 8 are filled. Recommended answers are flagged.

---

## Q1 — Tier confirmation
The `auth` codebase already exists (greenfield work done in cycle 1). This new request adds capability on top, so the natural Tier is **Feature**. Confirm?

A) **Feature** (Recommended) — new capability on existing product; ~10 BR items, Stages 5-7 in standard ceremony, Stages 8-14 per UoW
B) Greenfield — restart from scratch (NOT recommended unless the existing auth code is being thrown away)
C) Bugfix — minor patch only (NOT recommended — this is clearly new scope, not a defect repair)
X) Other (please describe after [Answer]: tag)

[Answer]:A`

---

## Q2 — How is the role determined?
The "merchant" vs "seller" distinction has to be decided somewhere. Pick the mechanism:

A) **User picks role at signup** (Recommended) — radio/segmented control on the signup form: "I am a … Merchant / Seller". Role becomes part of the User row.
B) Admin assigns role out-of-band — user signs up without a role; an admin marks them later (needs an admin tool we don't have yet)
C) Email domain detects role — e.g., `@codiste.com` → merchant, else seller (rigid; surprises users)
D) Default to one role; user can switch later in profile — start everyone as "seller" and offer an "upgrade to merchant" path
X) Other (please describe after [Answer]: tag)

[Answer]:`A`

---

## Q3 — Does the profile page show different content per role?
After login, the user lands on `/profile`. What does it look like for each role?

A) **Same layout, role-specific fields shown conditionally** (Recommended) — one Profile page that renders different field-blocks (e.g., merchant sees "business_name + GST/PAN", seller sees "preferred_payout_method") based on role
B) Entirely different routes — `/profile/merchant` and `/profile/seller`, separate components
C) Identical content for both — just a "role" badge but no other differences in v1
X) Other (please describe after [Answer]: tag)

[Answer]:A

---

## Q4 — Profile fields (v1 scope)
Which fields appear on the Profile page in v1? (Select all that apply — list letters comma-separated; "Other" goes in [Answer])

A) **Email, display_name, timezone, account_setup_completed** (Recommended baseline — already on the User row today)
B) Role badge (Merchant / Seller)
C) Created-at / member-since
D) Avatar / profile picture (NOT recommended for v1 — adds upload pipeline + storage)
E) Phone number (would need to be added to User table)
F) Address / location (would need to be added)
G) Merchant-only: business_name
H) Seller-only: payout method / preferred currency
X) Other (please describe after [Answer]: tag)

[Answer]:`A

---

## Q5 — `/dashboard` vs `/profile`
Today the `auth` UoW has a `/dashboard` route ("Hello, {display_name}" + Logout). What happens to it?

A) **Replace `/dashboard` with `/profile`** (Recommended for v1 thin-slice) — remove the dashboard route, `/profile` becomes the post-login landing page. Logout button moves to `/profile`.
B) Keep both — `/dashboard` stays as the greeting page, `/profile` is a separate route reachable from `/dashboard`
C) Rename `/dashboard` to `/profile` and amend its content to match the chosen profile shape
X) Other (please describe after [Answer]: tag)

[Answer]:B

---

## Q6 — Existing users (from auth UoW seeding)
The `auth` UoW already has signed-up users in the DB from yesterday's manual-QA walk. They have no role. What's the migration story?

A) **DB migration adds `role` column with a default for existing rows** (Recommended) — e.g., default to `seller`; existing users will see `seller` on their profile until they edit it
B) Force existing users to pick a role on next login (interrupt with a role-selection screen)
C) Drop the existing user data — fresh DB for the feature (the auth UoW is a learning experiment, so this is acceptable for v1)
X) Other (please describe after [Answer]: tag)

[Answer]:A

---

## Q7 — Role-based access control in v1
Are there any merchant-only or seller-only routes / actions in v1, or is the role purely descriptive for now?

A) **Role is descriptive only in v1** (Recommended thin-slice) — same routes for both; UI labels differ. RBAC enforcement is Stage-2 work after we know what each role actually does.
B) Merchant-only routes exist (specify which after [Answer]:)
C) Seller-only routes exist (specify which after [Answer]:)
D) Both have role-specific routes (specify)
X) Other (please describe after [Answer]: tag)

[Answer]:D

---

## Q8 — Role-specific signup fields
Beyond the existing signup form (email + display_name + password), does each role need additional fields at signup time?

A) **No extra fields at signup** (Recommended thin-slice) — collect role only at signup, leave merchant/seller-specific fields to the account-setup screen (which can branch on role)
B) Merchant signup also collects business_name (now required)
C) Seller signup also collects preferred_payout_method (now required)
D) Both have extra fields (specify)
X) Other (please describe after [Answer]: tag)

[Answer]:A`

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T19:40:00+05:30 | AI-DLC | Initial 8-question BR intake for new `roles-profile` Feature UoW. |
