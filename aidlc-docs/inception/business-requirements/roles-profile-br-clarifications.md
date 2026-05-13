# Business Requirements — Clarifications — `roles-profile` UoW

**Generated**: 2026-05-12T19:50:00+05:30
**Trigger**: Round-1 answers contained 2 contradictions + 1 unspecified detail. AI-DLC § `common/question-format-guide.md` requires detection + clarification before advancing to the BR checklist.

---

## C1 — Resolve Q5=B + Q7=D + original-ask alignment
Your Q5 = B means **both `/dashboard` and `/profile` exist**. Your original chat ask was *"After successful login we need to saw the profile with logout"*. Pick the post-login landing page + Logout placement:

A) **`/profile` is the post-login landing page; `/dashboard` is reachable via a link from /profile** (matches your original ask most directly). Logout button lives on /profile.
B) **`/dashboard` stays as post-login landing (greeting + Logout); `/profile` is reachable via a link from /dashboard** (most additive — least disruption to the auth UoW that's already built). Logout button on both /dashboard and /profile.
C) Post-login routes by role — merchant → `/profile`; seller → `/dashboard` (or vice versa)
X) Other (please describe after [Answer]: tag)

[Answer]:B

---

## C2 — Q7 needs specifics: which routes are merchant-only and which are seller-only?
You answered D ("both have role-specific routes") but didn't list them. The v1 scope so far (per Q4 + Q8) does NOT introduce any role-specific fields or behaviour anywhere visible — so the only role-specific things possible in v1 are routes themselves. List the routes:

A) **Downgrade to Q7=A — role is descriptive only in v1; we revisit role-specific routes in a follow-up Feature UoW** (Recommended — keeps this UoW small and shippable since no concrete role-routes have been described yet)
B) Merchant-only routes I want now: (list after [Answer]: as `/path-1, /path-2, …`)
C) Seller-only routes I want now: (list after [Answer]: as `/path-1, /path-2, …`)
D) Both (list both sets on separate lines after [Answer]:)
X) Other (please describe after [Answer]: tag)

[Answer]: for now dashbpard and profile common for both.

---

## C3 — Q4 → role visibility
Your Q4 = A means **no role badge** on /profile, but the role exists in the DB and (per Q7) may gate routes. Should the role be visible to the user **anywhere** in the UI?

A) **Yes — show a small "Merchant" / "Seller" badge in the app header** (Recommended — users need to know what they signed up as; cheap to implement; doesn't break Q4 since /profile fields are unchanged)
B) Yes — add Role badge to /profile after all (effectively amends Q4 to A,B)
C) No — keep role completely invisible in the UI for v1; it only affects URL routing per C2
X) Other (please describe after [Answer]: tag)

[Answer]:

---

## Reply
Once all 3 `[Answer]:` tags are filled, reply `done` in chat. I'll then generate the Feature-tier BR checklist + tier.md and present the Gate-#1 signoff.
