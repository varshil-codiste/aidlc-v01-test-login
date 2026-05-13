# Requirements — Verification & Extension Opt-In Questions

**Tier**: Greenfield → Depth = **Comprehensive**
**Source context loaded**: BR (business-requirements.md), Design Intake (branding.md, design-tokens.md, screen-flow-map.md). No Reverse Engineering (greenfield).

The first block formalizes the **4 extension opt-ins** (mandatory per `requirements-analysis.md` Step 5). The second block resolves the remaining **gaps from completeness analysis** — most are pre-marked with a Recommended answer that flows from the BR + Design.

---

# Part A — Extension Opt-Ins (4 mandatory questions)

## Question A1 — Security Baseline Extension
Should the Security Baseline rules (15 rules, OWASP-aligned) be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (Recommended for production-grade production deliverables) **(Recommended — auth flow + password storage + JWT + reference-implementation goal all argue for it)**
B) No — skip all SECURITY rules (suitable for proof-of-concept, internal-only tools, or experimental work)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question A2 — Accessibility Extension (WCAG 2.2 AA)
Does this project have a UI surface (Web or Mobile) that should comply with WCAG 2.2 AA?

A) Yes — enforce all WCAG 2.2 AA rules as blocking constraints **(Recommended — BR § 3.5 + followup Q15=A already commit to AA)**
B) Partial — enforce only "Level A" rules
C) No — this project has no UI or a11y is out of scope
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question A3 — Property-Based Testing Extension
Should Property-Based Testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (Recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers) **(Recommended for this v1 — thin auth slice; standard unit + integration tests will suffice)**
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question A4 — AI/ML Lifecycle Extension
Does this project use LLMs, embeddings, RAG, fine-tuning, or any ML model?

A) Yes — enforce AI/ML lifecycle rules
B) Partial — only LLM calls without RAG / fine-tuning
C) No — this project has no AI/ML component **(Recommended — BR § 3.1 confirms no AI/ML in v1)**
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

# Part B — Gap-fill questions from completeness analysis

Areas the Comprehensive analysis flagged as needing decision. Most are routine for a thin auth slice and are pre-marked Recommended.

## Question B1 — Session strategy (functional + NFR)
How do we authenticate subsequent requests after login?

A) JWT access token (15 min) + refresh token (7 days), HTTP-only secure cookies for both; refresh-token rotation on every use (Codiste preset default) **(Recommended)**
B) Plain JWT only, in `Authorization: Bearer` header, longer-lived (e.g. 1 day) — simpler, less secure
C) Server-side sessions in DB / Redis, session cookie
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B2 — Password policy (NFR — usability vs security)
What's the minimum password rule?

A) ≥ 12 characters, no other constraints (Codiste preset default; NIST 800-63B-aligned) **(Recommended)**
B) ≥ 8 characters with mixed case + number + symbol (older NIST guidance)
C) ≥ 16 characters (stricter)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B3 — Rate-limiting on auth endpoints (NFR — security)
Should login attempts be rate-limited to defend against credential stuffing / brute force?

A) Yes — limit to 5 failed attempts per email per 15 minutes; in-memory counter sufficient for v1 (≤ 50 users) **(Recommended — security extension would require this anyway)**
B) Yes — but require Redis for production-grade counter (over-engineering for v1)
C) No — out of scope for v1
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B4 — Email-verification stub design (per BR Open Q #2)
BR Q9=A says "log to console" for email verification. Concretely, what shape should the stub take?

A) On signup, log `{to, subject, body, verificationToken}` to stdout as a single JSON line; account is **auto-marked verified** immediately (no token check needed) — fastest v1 path **(Recommended — keeps scope thin)**
B) Log the verification email AND require the user to copy the token from the console log into a verification page before account is verified — closer to real flow
C) Skip — no verification at all; account is verified at signup
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B5 — Account-setup form scope (per Design Open Q #1)
Figma supplies the landing only — no signup form, no account-setup form. v1 needs a minimum account-setup screen. What fields?

A) Just `display_name` (pre-filled from signup) + `timezone` (default Asia/Kolkata, dropdown) — minimum viable **(Recommended)**
B) Same as A + optional `bio` textarea (160 chars max)
C) Same as A + `phone_number` (but BR § 2.8 said Level Low PII — no phone)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B6 — Collapse the two left-panel CTAs? (per Design Open Q #3)
Figma shows two CTAs: "Merchant Registration" + "Create Merchant Profile". For v1 we don't issue Merchant Ids, so these collapse.

A) Single CTA "Sign Up" → goes to Signup form → on submit, redirects to Account Setup form → on submit, redirects to Dashboard **(Recommended)**
B) Keep two visual CTAs but both point to the same Signup flow (preserves Figma layout)
C) Re-design the left panel — drop the second CTA
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B7 — Logout flow
Where does the user end up after Logout?

A) Back to Landing (login form visible) with a transient "Signed out" toast **(Recommended)**
B) Back to Landing with no toast
C) A dedicated "You've been signed out" page
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B8 — Observability minimum (NFR — Codiste profile says Sentry + Datadog)
For a learning experiment, what's the observability floor?

A) Structured JSON logs to stdout with the required fields from `aidlc-profile.md` (timestamp, level, request_id, user_id, trace_id, etc.); Sentry / Datadog wiring deferred to Stage 18 only if useful **(Recommended)**
B) Same as A + free-tier Sentry SDK wired (error events only)
C) Full Codiste preset (Sentry + Datadog + 90-day retention) — over-engineering for v1
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B9 — Database choice (NFR — affects Stage 11)
What backing store for v1?

A) PostgreSQL (Codiste preset for production-shaped projects; Prisma migrations) — slightly heavier setup but reusable as a reference impl **(Recommended given goal B from BR Q4 = reference implementation)**
B) SQLite (single-file; trivial setup) — simpler for learning, but doesn't reflect Codiste production stack
C) Defer to Stage 11 — Stack Selection
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B10 — Container / dev environment (NFR — affects Stage 16)
What's the dev / run environment?

A) `docker-compose up` — Postgres + backend + frontend in one go (matches Codiste convention) **(Recommended)**
B) Local install — Postgres on host, `npm run dev` for FE + BE
C) Defer to Stage 16
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B11 — Avenir font licensing (per Design Open Q #2)
Avenir is commercial. v1 plan?

A) Use the open-source fallback (`Inter`) for v1; document the swap; if reused on a client engagement, license Avenir then **(Recommended for learning experiment)**
B) License Avenir now and use it
C) Use the next-closest Google-Fonts free alternative (e.g., `Nunito` — Avenir-adjacent geometric)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question B12 — Account deletion on test failure (operational)
BR § 3.2 says deletion is out of scope. But for the learning experiment, the team will create + abandon test accounts. How are they cleaned?

A) No deletion; `aidlc-docs/operations/runbook.md` will document "`docker-compose down -v` to wipe the dev DB" **(Recommended — internal experiment, ephemeral)**
B) Add a simple internal `/admin/wipe-test-accounts` endpoint guarded by an env-var token
C) Manual SQL truncate is fine
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

# Fast-path option

If all 16 questions above can be answered with the Recommended choice (this is the typical "small learning experiment" answer set), reply **`done — accept all recommendations`** and I'll mark them and proceed.

Otherwise, fill `[Answer]:` tags individually and reply **done**.

## After answers:
1. Record extension enablement in `aidlc-state.md` § Extension Configuration
2. Lazy-load opted-in rule files (`security-baseline.md`, `accessibility.md`)
3. Synthesize `requirements.md` with FR / NFR / scenarios / traceability matrix
4. Generate `requirements-analysis-checklist.md`
5. Present the standardized Stage 4 completion message
