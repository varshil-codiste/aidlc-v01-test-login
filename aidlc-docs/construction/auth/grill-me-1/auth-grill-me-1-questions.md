# Grill-Me #1 — auth UoW

**Type**: Read-back sub-ritual post-Stage 9, pre-Stage 10.
**Tier**: Greenfield
**Questions**: 12
**Pass threshold**: ≥ 0.85 (i.e., ≥ 11/12 correct)
**Open-book**: yes — you may consult any artifact in `aidlc-docs/`. The point is to verify that you can *find* the answer in the source documents, not to test your memory.

> Pick one letter A–D for each question. If none fits, choose `X) Other` and explain — I'll grade your free-text against the ground truth semantically. Fill all `[Answer]:` tags and reply **done**. I'll score and write per-question verdicts to `auth-grill-me-1-results.md`. On PASS, we advance to Stage 10. On FAIL (< 0.85), you pick Branch A (revise wrong answers) or Branch B (update FR/NFR and loop back to Stage 8/9).

---

## Question 1
According to **BR-A02** in `business-rules.md`, *where* is the email address normalized to lowercase?

A) Postgres `CITEXT` extension handles case-insensitivity at the database level; the app passes the email through verbatim
B) A functional unique index `lower(email)` on a `TEXT` column; the app passes the email through verbatim
C) Only at the FE form-validation layer; the BE accepts whatever case is sent
D) In application code (`User.normalize(email)`) before any INSERT, SELECT, or comparison
X) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 2
According to **BR-A03** in `business-rules.md`, what password-hashing algorithm and parameters does the BE use?

A) `bcrypt` with cost factor 12
B) `PBKDF2-SHA256` with 600,000 iterations
C) `Argon2id` with memory ≥ 19 MiB, iterations ≥ 2, parallelism = 1
D) `scrypt` with N = 2^17, r = 8, p = 1
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 3
According to **BR-A06**, what is the failed-login rate-limit threshold?

A) 5 attempts per 15-minute rolling window, per email
B) 3 attempts per 10-minute rolling window, per email
C) 10 attempts per 1-minute rolling window, per email
D) 5 attempts per 24-hour window, per IP address
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 4
According to **BR-A07** (account-enumeration safety), what is the response shape for "email already registered" (signup) versus "wrong password" (login)?

A) Each returns a specific user-facing message identifying the failure cause so users can self-diagnose
B) Signup-duplicate returns 409 with `"email already exists"`; login-fail returns 401 with `"invalid credentials"` — different bodies
C) Both signup-duplicate and login-fail are produced by a single shared error builder (`AuthService.invalidCredentialsError()`) and return a byte-identical RFC 7807 envelope
D) Login-fail returns 401 with a message; signup-duplicate returns 200 with a silent redirect (security through obscurity)
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 5
According to **BR-A08** and `application-design/services.md`, what algorithm signs the JWTs and how is the public key exposed?

A) `HS256` with a shared secret loaded from `JWT_SECRET` env var; no public-key endpoint
B) `ES256` with an elliptic-curve key; key fetched from a third-party JWKS provider
C) `PS512` with a rotating key managed by a KMS
D) `RS256` with the private key loaded from `JWT_PRIVATE_KEY` env var; the public key is exposed via `GET /.well-known/jwks.json`
X) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 6
According to **BR-A09**, what happens when a refresh token is presented for rotation but has already been rotated (i.e., it is a replay)?

A) The replayed token returns 401; only that specific token is invalidated; other tokens in the same family stay valid
B) Both the rotated token AND its replay attempt are revoked, but the parent and siblings in the family stay valid
C) The entire session family (every refresh token sharing the `family_id`) is revoked; the user must log in again
D) Only the *most recent* valid token in the family is revoked; older valid tokens (if any) remain
X) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 7
According to **BR-A10**, which exact cookie flags are set on the `access_token` and `refresh_token` cookies?

A) `HttpOnly` only
B) `HttpOnly` + `Secure` (in all environments including dev) + `SameSite=Strict` + path-restricted
C) `HttpOnly` + `Secure` (always, including dev) + no `SameSite` directive + `Path=/`
D) `HttpOnly` + `Secure` (only when `APP_ENV != "dev"`) + `SameSite=Lax` + `Path=/`
X) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 8
According to **BR-A11** and `frontend-components.md`, how is the "account-setup gating" enforced — i.e., how is a logged-in user with `account_setup_completed=false` kept on the `/account-setup` route?

A) The BE returns HTTP 403 for any non-setup route until setup completes
B) The FE `AuthGuard` reads `user.account_setup_completed` from the cached `/users/me` response and redirects to `/account-setup` when needed
C) The BE always returns HTTP 302 (server-side redirect) from every non-setup route
D) The FE shows a blocking modal saying "complete setup first" but still renders the requested page underneath
X) Other (please describe after [Answer]: tag below)

[Answer]:b

---

## Question 9
According to **NFR-TEST-002** (NFR-T02 in `requirements.md`), which four invariants must property-based tests cover?

A) FE component render purity, accessibility-tree consistency, theme-token stability, responsive-breakpoint behavior
B) Database transaction isolation, request-id propagation, log JSON-schema validity, env-var fail-fast
C) Password-hash round-trip; JWT round-trip; email-normalize idempotence; refresh-token rotation (N rotations → N+1 distinct tokens + replay revokes family)
D) Argon2id memory-parameter bounds, JWT-algorithm correctness, cookie SameSite enforcement, session-expiry equality
X) Other (please describe after [Answer]: tag below)

[Answer]:c

---

## Question 10
According to **NFR-PERF-001** in `auth-nfr-requirements.md`, what is the p95 API-latency target on the docker-compose dev stack at ≤ 50 users?

A) ≤ 100 ms
B) ≤ 200 ms
C) ≤ 500 ms
D) No specific target — measure-as-you-go and tune post-launch
X) Other (please describe after [Answer]: tag below)

[Answer]:b

---

## Question 11
According to the **Stage 8 Q2 = A** answer (recorded in `auth-functional-design-checklist.md`), what exact field set does the email-verification stub JSON line emit to stdout on signup?

A) `{to, subject, body, verificationToken}` — 4-field minimal shape
B) `{event, user_id}` — 2-field minimal shape with no email content
C) The full SMTP envelope (from, to, headers, body) JSON-encoded
D) `{event, to, subject, body, verification_token, request_id, timestamp}` — 7-field structured shape
X) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 12
According to **ADR-004** in `application-design.md` and Stage 6 Q5 = A, what is the data store for the `auth` UoW in v1?

A) PostgreSQL 16, single instance, via docker-compose
B) PostgreSQL 16 with a synchronous read-replica HA pair
C) SQLite, single file, embedded in the BE
D) MySQL 8, single instance
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

When all 12 `[Answer]:` tags are filled, reply **done**. I will score and write per-question verdicts to `auth-grill-me-1-results.md`.
