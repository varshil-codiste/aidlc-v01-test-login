# Business Rules — auth UoW

**Generated**: 2026-05-12T00:15:00Z
**Naming**: `BR-A{NN}` (Auth Business Rule, two-digit)
**Sources**: NFR-S01..S10, FR-001..022, Stage-8 Q1..Q7 answers (all A)

Each rule carries: statement, applies-to (which endpoint / form / component), enforcement points (DB / API / FE), error code, and the literal user-facing copy that the FE renders.

---

## BR-A01 — Email format
**Statement**: Email must match RFC 5321 form and be ≤ 254 characters.
**Applies to**: signup form, login form.
**Enforcement**:
- **API**: zod / pydantic schema with `email()` validator + max-length 254 → 400 RFC 7807.
- **FE**: HTML5 `type="email"` + same schema (visual only).
**Error code**: `auth.email.invalid`
**User-facing copy**: "Enter a valid email address."

## BR-A02 — Email lowercase normalization
**Statement**: Email values are normalized to lowercase **in application code** before any INSERT, SELECT, or comparison.
**Applies to**: signup, login, internal lookups.
**Enforcement**:
- **BE service layer**: `User.normalize(email) → email.trim().toLowerCase()`
- **API**: validation runs on the normalized form; original casing is never persisted.
- **NFR-T02c**: property-based test verifies `normalize(normalize(e)) === normalize(e)` (idempotence).
**Error code**: N/A (silent normalization; user not notified).
**User-facing copy**: N/A.

## BR-A03 — Password storage
**Statement**: Passwords are stored only as Argon2id hashes; plaintext NEVER hits any disk, log, or response body.
**Applies to**: signup, internal password verification.
**Enforcement**:
- **BE service**: `PasswordHasher.hash()` uses `argon2id` with memory ≥ 19 MiB, iterations ≥ 2, parallelism 1.
- **DB**: `users.password_hash` is the only place a password-related value is stored; its value always starts with `$argon2id$`.
- **Logger sanitization** (NFR-S07): the logger never emits `password`, `password_hash`, or any field name matching `/secret|key|token/i` from request/response bodies. Sensitive fields are replaced with `[REDACTED]`.
- **NFR-T02a**: property-based test `verify(hash(p)) === true` for any password of length ≥ 12.
**Error code**: N/A (internal invariant).
**User-facing copy**: N/A.

## BR-A04 — Display name length
**Statement**: `display_name` must be 1–100 characters, non-whitespace-only.
**Applies to**: signup form, account-setup form.
**Enforcement**:
- **API**: schema-validated; trims surrounding whitespace; rejects empty string after trim.
- **FE**: same constraint client-side.
**Error code**: `auth.display_name.invalid`
**User-facing copy**: "Display name is required and must be at most 100 characters."

## BR-A05 — Password policy
**Statement**: Passwords must be ≥ 12 characters. No other character-class requirement (Q6=A; NIST 800-63B alignment).
**Applies to**: signup form, (no password-change flow in v1).
**Enforcement**:
- **API**: zod / pydantic min-length 12 → 400.
- **FE**: same constraint; submit button disabled until met.
**Error code**: `auth.password.too_short`
**User-facing copy**: "Password must be at least 12 characters."

## BR-A06 — Login rate-limit
**Statement**: A given email may attempt login at most 5 times per 15-minute rolling window. The 6th attempt within the window returns 429 with `Retry-After`.
**Applies to**: `POST /auth/login` only.
**Enforcement**:
- **BE middleware**: in-memory map `email → [failed_timestamps]`; on each failure append now(); on each attempt evict timestamps older than 15 minutes; if ≥ 5 remain → reject with 429.
- **In-memory state** (Q3=A): single-process; reset on BE restart.
- **NFR-S04**: integration test simulates 5 fails + 1 → 429.
**Error code**: `auth.rate_limit.exceeded`
**User-facing copy**: "Too many attempts. Try again in {N} minutes." (FE reads `Retry-After` header.)

## BR-A07 — Account enumeration safety
**Statement**: The responses for "email already registered" (on signup) and "email or password invalid" (on login) MUST be **byte-identical** in body. Status codes may differ if necessary.
**Applies to**: `POST /auth/signup`, `POST /auth/login`.
**Enforcement**:
- **BE service**: `AuthService.invalidCredentialsError()` returns a single RFC 7807 envelope reused by both signup-duplicate and login-fail paths.
- **NFR-S09**: paired integration test asserts byte-identical bodies between the two cases.
**Error code**: `auth.credentials.invalid`
**User-facing copy**: "Email or password is invalid."

## BR-A08 — JWT signing
**Statement**: Access + refresh tokens are signed RS256. Public key is exposed at `GET /.well-known/jwks.json`. Private key is loaded from `JWT_PRIVATE_KEY` env var and never logged.
**Applies to**: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`.
**Enforcement**:
- **BE bootstrap**: private/public key pair loaded from env vars; bootstrap fails fast if missing.
- **NFR-T02b**: property-based test verifies JWT round-trip.
**Error code**: N/A (internal invariant).
**User-facing copy**: N/A.

## BR-A09 — Refresh token rotation + replay
**Statement**: Every successful `POST /auth/refresh` rotates the refresh token. If a refresh token presented has already been rotated (i.e., `rotated_at IS NOT NULL`), the entire session family is revoked and the request is rejected.
**Applies to**: `POST /auth/refresh`.
**Enforcement**:
- **BE service**: see `application-design/services.md` § Refresh flow steps 6-9.
- **NFR-T02d**: property-based test verifies rotation produces N+1 distinct tokens, only the latest is valid, replay revokes the family.
**Error code**: `auth.session.invalid`
**User-facing copy**: "Your session has expired. Please sign in again." (FE redirects to Landing.)

## BR-A10 — Cookie flags
**Statement**: Both `access_token` and `refresh_token` cookies are set with `HttpOnly`, `Secure` (only in `APP_ENV != "dev"`), `SameSite=Lax`, `Path=/`.
**Applies to**: signup, login, refresh.
**Enforcement**:
- **BE controllers**: cookie-set helper enforces these flags.
- **NFR-S03**: integration test reads response headers and asserts all flags.
**Error code**: N/A.
**User-facing copy**: N/A.

## BR-A11 — Account setup gating
**Statement**: A user who is authenticated but has `account_setup_completed = false` is redirected to `/account-setup` for any non-setup route. A user who is already setup-complete is redirected to `/dashboard` if they visit `/account-setup`.
**Applies to**: FE route guard, BE `GET /users/me` indicator.
**Enforcement**:
- **FE `AuthGuard`**: checks `user.account_setup_completed`; redirects accordingly.
- **NFR**: covered by US-002 E9 + E10 scenarios at Stage 14 Manual QA.
**Error code**: N/A (redirect, not error).
**User-facing copy**: N/A.

## BR-A12 — Logger sanitization
**Statement**: Logger never emits plaintext passwords, JWTs, refresh tokens, full request bodies for auth endpoints, or full email addresses (last is debatable but Codiste house treats email as PII). When user_id is needed in a log, the UUID is used.
**Applies to**: all backend logs.
**Enforcement**:
- **BE Logger**: redact list keyed by header / body-field name; redacts before serialization.
- **NFR-S07**: log-scrape test in CI greps for `$argon2id$`, `eyJ` (JWT header), and plaintext password values; FAILS if any match.
**Error code**: N/A.
**User-facing copy**: N/A.

---

## Error code catalog (consolidated)

| Code | Source rule | Status | RFC 7807 `type` |
|------|-------------|--------|-----------------|
| `auth.email.invalid` | BR-A01 | 400 | `/errors/validation` |
| `auth.password.too_short` | BR-A05 | 400 | `/errors/validation` |
| `auth.display_name.invalid` | BR-A04 | 400 | `/errors/validation` |
| `auth.credentials.invalid` | BR-A07 | 401 | `/errors/credentials` |
| `auth.rate_limit.exceeded` | BR-A06 | 429 | `/errors/rate-limit` |
| `auth.session.invalid` | BR-A09 | 401 | `/errors/session` |
| `auth.unauthenticated` | BR-A11 / generic | 401 | `/errors/unauthenticated` |
| `auth.server_error` | (generic) | 500 | `/errors/internal` |

All RFC 7807 responses include the Codiste-house `request_id` extension field per `application-design.md` § 2.

---

## Compliance summary

| NFR | Owning rule(s) |
|-----|-----------------|
| NFR-S01 (Argon2id params) | BR-A03 |
| NFR-S02 (RS256 + JWKS) | BR-A08 |
| NFR-S03 (cookie flags) | BR-A10 |
| NFR-S04 (rate limit) | BR-A06 |
| NFR-S06 (input validation) | BR-A01, BR-A04, BR-A05 |
| NFR-S07 (no PII in logs) | BR-A12 |
| NFR-S09 (enumeration safety) | BR-A07 |
| NFR-S10 (rotation + family revoke) | BR-A09 |
| NFR-T02a (hash round-trip) | BR-A03 |
| NFR-T02b (JWT round-trip) | BR-A08 |
| NFR-T02c (email normalize idempotence) | BR-A02 |
| NFR-T02d (refresh rotation) | BR-A09 |
| NFR-A* (a11y) | covered in `frontend-components.md` |
