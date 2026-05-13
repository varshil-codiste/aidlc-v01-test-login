# Functional Design Questions — auth UoW

Seven items the Stage-8 plan flagged as needing decision. Each carries a Recommended answer pre-marked from prior artifacts + Codiste preset.

---

## Question 1 — Subtitle contrast fix (NFR-A04 carry-forward)
The `#908d8d` subtitle color on white gives only 4.0:1 contrast → fails WCAG AA for body text. How do we fix?

A) **Darken token to `#737272`** (~4.6:1 contrast); update `design-tokens.json` + `branding.md` modification log; visually negligible on a light background **(Recommended)**
B) Keep `#908d8d` but use it ONLY for large text (≥ 18pt or ≥ 14pt bold) where the AA threshold is 3:1
C) Defer to designer review — block the UoW until team lead confirms
X) Other

[Answer]:A

## Question 2 — Email-verification stub JSON schema (US-001 AC#4 carry-forward)
What exact fields does the single stdout JSON line carry on signup?

A) **`{event: "email_verification_stub", to, subject, body, verification_token, request_id, timestamp}`** — `event` field makes it greppable; `request_id` correlates to other logs; timestamp is ISO 8601 UTC; verification_token is generated even though auto-verify is on (for log-shape realism per finding #5 in plan) **(Recommended)**
B) Minimal: `{to, subject, body, verificationToken}` only — matches US-001 AC#4 literal
C) Just `{event: "email_verification_stub", to, user_id}` — no body, no token (we never use them)
X) Other

[Answer]:A

## Question 3 — `failed_login_attempts` storage
Where do failed-login attempts live for rate-limit enforcement?

A) **In-memory map** (single-process; reset on BE restart; sufficient for ≤ 50 users; matches FR-010 "in-memory counter") **(Recommended for v1)**
B) `failed_login_attempts` Postgres table (audit-grade; survives restart; slight extra write per failed attempt)
C) Both — in-memory for rate-limit decisions + DB for audit append-only log
X) Other

[Answer]:A

## Question 4 — Case-insensitive email storage
Postgres approach for email uniqueness regardless of case?

A) **Normalize email to lowercase in application code** before INSERT/SELECT; column is `TEXT` with a unique index; portable across Postgres / SQLite / etc. **(Recommended — also enables the NFR-T02c idempotence property test naturally)**
B) Postgres `CITEXT` extension; database enforces case-insensitivity natively
C) Functional unique index `lower(email)` on a `TEXT` column
X) Other

[Answer]:A

## Question 5 — CSRF protection layer
SameSite=Lax cookies block cross-site POST CSRF in modern browsers. Do we also add a CSRF token?

A) **No additional CSRF token.** SameSite=Lax + same-origin FE is sufficient for v1; we will document the assumption in `services.md`. **(Recommended — keeps thin slice; aligns with most modern auth tutorials)**
B) Yes — issue a double-submit CSRF token cookie + header pair for all state-changing endpoints (`POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `PATCH /users/me/profile`)
C) Switch to `SameSite=Strict` (stricter than Lax; breaks any cross-site link to logged-in routes — too aggressive)
X) Other

[Answer]:A

## Question 6 — Password policy beyond length
≥ 12 chars is set. Do we also check against common-password lists?

A) **No — length only.** Aligns with NIST 800-63B and the Codiste preset; `≥ 12 chars` significantly reduces brute-force risk; common-password screening is nice-to-have but adds data dependency **(Recommended)**
B) Yes — block the top 10,000 passwords from a static list bundled with the BE (no external API)
C) Yes — call HIBP `pwnedpasswords` API for every signup (adds external integration — violates BR Q9=A)
X) Other

[Answer]:A

## Question 7 — Approval to proceed to Part 2
A) **Approve the plan and the answers above; generate Part 2 artifacts now** (`domain-entities.md` + `business-rules.md` + `business-logic-model.md` + `frontend-components.md` + checklist) **(Recommended)**
B) Pause — I want to write something into the plan myself before Part 2 runs
X) Other

[Answer]:A

---

## Fast path
If all 7 Recommended answers fit, reply **`approved`** (or **`done — accept all recommendations`**) and I'll generate Part 2:

- `construction/auth/functional-design/domain-entities.md` (2 entities + ER diagram)
- `construction/auth/functional-design/business-rules.md` (≈10 rules with error codes)
- `construction/auth/functional-design/business-logic-model.md` (5 Mermaid sequence diagrams)
- `construction/auth/functional-design/frontend-components.md` (concrete FE table w/ `data-testid` per element)
- `construction/auth/functional-design/auth-functional-design-checklist.md`

Then the Stage 8 completion message → Continue → Stage 9 (NFR Requirements + the `/grill-me-1` sub-ritual).
