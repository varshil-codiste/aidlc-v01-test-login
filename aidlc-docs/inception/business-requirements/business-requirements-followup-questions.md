# Business Requirements — Follow-Up Questions (Round 1)

16 unresolved checklist items. Each is multiple-choice with a "(Recommended)" tag tuned to your stated framing ("small scope, learning experiment"). Pick `A` (or the recommended letter) to move fast; pick `B`/`C`/`X` to deviate. After all are answered, BR will pass to Gate #1.

---

## Section A follow-ups

### Q1 — Target users / personas (checklist A.2)
Who is the *intended* user of the login + account-setup flow?

A) Internal Codiste teammates only — the flow is a sandbox; never exposed to external customers **(Recommended — fits "learning experiment for our team")**
B) A future external customer base, but for this v1 we'll only seed internal accounts
C) A specific client / product (please name after the [Answer]: tag)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q2 — Success metrics (checklist A.3)
What success looks like for this experiment.

A) Workflow milestone: AI-DLC v0.1 completes end-to-end (all 5 Gates signed, Manual QA all-PASS, /grill-me-{1,2} pass) — the **process** is the metric, not the product KPI **(Recommended)**
B) Product KPI: ≥ N successful signups in 1 week of internal use (state N after [Answer]:)
C) Both A + a product KPI
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q3 — Out-of-scope items (checklist A.4)
What we explicitly will NOT build in v1. (Select all that apply, e.g. `A,B,D`.)

A) Password reset / "forgot password" flow **(Recommended — keep v1 thin)**
B) Social/OAuth login (Google, GitHub, etc.) **(Recommended — keep v1 thin)**
C) Multi-factor authentication (MFA / TOTP / SMS OTP) **(Recommended — keep v1 thin)**
D) Email verification (sending real emails) **(Recommended for v1 — stub or skip)**
E) Profile / avatar upload **(Recommended — out)**
F) Admin / user-management dashboard **(Recommended — out)**
G) Account deletion (GDPR-style data erasure) **(Recommended — out)**
H) None of the above — include everything
X) Other (please describe after [Answer]: tag below)

[Answer]: A,B,C,D,E,F,G

### Q4 — Business goals (checklist A.5)
What outcome justifies the effort.

A) Team enablement / training — Codiste devs need a worked example of AI-DLC v0.1 to teach the org **(Recommended)**
B) Reference implementation we will reuse on real client engagements
C) Both A + B
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Section B follow-ups

### Q5 — Target platforms (checklist B.1)
Where the app runs.

A) Web only (responsive — desktop + mobile browser) **(Recommended — Figma design is a web layout)**
B) Web + native mobile (Flutter)
C) Native mobile only
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q6 — Expected scale (checklist B.2)
Order of magnitude.

A) ≤ 50 internal users total; sporadic use; effectively zero QPS **(Recommended for internal experiment)**
B) Hundreds of users, low QPS (single VM is enough)
C) Thousands of users / production-shaped
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q7 — Timeline (checklist B.4)
Hard milestone, if any.

A) No hard deadline — finish whenever AI-DLC walks us to Gate #5 cleanly **(Recommended for learning)**
B) Soft target: 1 week (5 working days)
C) Soft target: 2 weeks (10 working days)
D) Hard deadline (state the date after [Answer]:)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q8 — Regulatory / compliance (checklist B.6)
Which regimes apply.

A) None — internal experiment, no real PII collection beyond email + hashed password **(Recommended)**
B) GDPR-shaped (assume Codiste is EU-facing eventually; do nothing now but don't paint ourselves into a corner)
C) Other (state after [Answer]:)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q9 — External integrations (checklist B.7)
Which third-party services this v1 needs.

A) None — log emails to console for "verification" stubs; everything else is in-process **(Recommended for v1 thin slice)**
B) Email provider only (e.g., Resend / Postmark / SES) for real verification emails
C) Email + an OAuth provider (Google)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q10 — Data classification (checklist B.8)
What sensitivity-level data flows through the system.

A) PII at level "Low — email + display name + Argon2id-hashed password" only **(Recommended — no card data, no health data, no IDs)**
B) PII Level Medium (add real address / phone / DoB)
C) PII Level High (add government ID / SSN / financial data)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q11 — Launch markets / locales (checklist B.9)
Geography and language.

A) English only, en-US copy; no i18n framework in v1 (architecture should not preclude adding it) **(Recommended)**
B) English + 1 other locale (state after [Answer]:)
C) Multi-locale from day 1
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Section C follow-ups (Codiste / AI-product specifics)

### Q12 — AI/ML usage scope (checklist C.1)
Does this product use LLMs / RAG / classifiers?

A) None — login + account-setup is a non-AI flow; no LLM / RAG / classifier in v1 **(Recommended)**
B) Some — describe after [Answer]:
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q13 — Data retention (checklist C.2)
How long we keep things.

A) Account record retained while account is active; auth logs 90 days (Codiste preset default); never trained on user data **(Recommended)**
B) Custom retention (state after [Answer]:)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q14 — Existing IP / OSS dependencies (checklist C.4)
Standard auth libs to inherit / forbid.

A) Use battle-tested OSS: Argon2id for password hashing (`argon2` lib), jose / jsonwebtoken for JWT (RS256 per Codiste preset), zod / class-validator for input validation **(Recommended)**
B) Avoid the above; state preferred libs after [Answer]:
C) Bring our own internal auth library (state after [Answer]:)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q15 — Accessibility commitment (checklist C.5)
WCAG target.

A) WCAG 2.2 AA — opt IN to the `accessibility` extension at Stage 4 **(Recommended for any user-facing flow)**
B) WCAG 2.2 A only
C) No accessibility target for v1 (learning experiment — defer)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

### Q16 — Legal review (checklist C.6)
Privacy policy / Terms of Service plan.

A) Deferred — internal experiment; no public Privacy Policy / ToS needed in v1; placeholders only **(Recommended)**
B) Required — write privacy policy + ToS as part of v1 scope
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## How to answer

The recommended answer letter is marked **(Recommended)** on every question. If "Recommended for everything" is your intent (it usually is for a learning experiment), reply `done — accept all recommendations` and I'll mark every blank `[Answer]:` with the recommended letter, log it in audit.md, and proceed.

Otherwise, fill the `[Answer]:` tags individually with letters (e.g. `A`, `B`, `A,C`) and reply **done**.

After this round, I will:
1. Resolve every checklist `[ ]` to `[x]` or `[~] N/A: <reason>` (no `[ ]` remaining)
2. Synthesize `business-requirements.md` (canonical)
3. Generate `business-requirements-signoff.md` (Gate #1) for Chintan + Varshil
