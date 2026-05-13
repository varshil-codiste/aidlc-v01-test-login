# NFR Design Patterns — auth UoW

**Generated**: 2026-05-12T00:20:00Z
**Naming**: `P-{CATEGORY}-{NN}` (Pattern + category + two-digit).
**Library names are illustrative**; **framework-specific choices are deferred to Stage 11** (per ADR-006). The Codiste-preset (TS/Node) library is shown as the leading candidate.

---

## Resilience

### Pattern P-RES-001: Idempotent endpoints
**Applies to**: NFR-REL-004 (idempotent logout)
**Implementation**:
- `POST /auth/logout` returns 204 whether or not the caller has a cookie.
- No side effect when cookie missing/invalid.
- Test: assert that calling logout twice in a row returns 204 both times.

### Pattern P-RES-002: Fail-fast bootstrap
**Applies to**: NFR-REL-003 (env-var fail-fast)
**Implementation**:
- On boot, the BE reads `DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `FE_ORIGIN`, `APP_ENV`.
- Missing or empty → log RFC-shaped error to stderr and exit with code 1 BEFORE the HTTP server starts.
- Test: integration test launches the BE with each required var stripped; asserts exit ≠ 0.

> *N/A patterns (explicit)*: retries, circuit breakers, bulkheads, timeouts beyond the ORM's default — v1 has zero external integrations (BR Q9=A).

---

## Scalability

> **N/A patterns (explicit)**: caching layers, async processing, sharding, read replicas — v1 is ≤50 users on a single BE process (NFR-SCAL-001/002). Multi-process readiness is documented but not exercised in v1.

### Pattern P-SCAL-001: In-memory rate-limit counter (with documented Redis-switchover path)
**Applies to**: NFR-SEC-004 / BR-A06
**Implementation**:
- A single in-memory `Map<email, timestamp[]>` lives in the BE process (LC-001).
- On each failed login, append `Date.now()`; on each attempt, evict entries older than 15 min; if length ≥ 5, reject with 429.
- Migration path documented in `runbook.md` — to scale to multiple BE processes, swap the `Map` for a Redis sorted-set with the same key/value semantics (no API-surface change).

---

## Performance

### Pattern P-PERF-001: Database connection pool
**Applies to**: NFR-PERF-001
**Implementation**:
- ORM pool size = **10** (Stage 10 Q1=A). Codiste house default; matches Prisma + node-postgres defaults.
- Idle timeout: 30s. Acquisition timeout: 5s.
- All queries use the pool; raw queries are forbidden in v1 (linted against direct `pg.Pool` import outside the repository layer).

### Pattern P-PERF-002: Response payload kept small
**Applies to**: NFR-PERF-001 / NFR-PERF-002
**Implementation**:
- All API responses (incl. error envelopes) are < 4 KB on the happy path.
- The `UserDto` excludes `password_hash`, internal flags, and any future audit fields by **inclusion** (whitelist), not exclusion.

### Pattern P-PERF-003: FE bundle code-split + SSR
**Applies to**: NFR-PERF-002 (Lighthouse Performance ≥ 90)
**Implementation**:
- FE framework chosen at Stage 11 must support SSR + route-level code splitting (Next.js App Router and Remix both qualify; plain Vite-CSR does not without manual config).
- Critical CSS for Landing inlined.

---

## Security

### Pattern P-SEC-001: Input validation at the boundary
**Applies to**: NFR-SEC-006 / BR-A01, A04, A05
**Implementation**:
- Schema-validation middleware (`zod` for TS/Node — likely Stage 11 pick) runs as the LAST middleware before the controller.
- Validates body / query / params per the OpenAPI schema; rejects on first violation with RFC 7807 `auth.*.invalid` codes.
- All validators are pure; no IO during validation.

### Pattern P-SEC-002: Authentication middleware
**Applies to**: NFR-SEC-003 / BR-A10
**Implementation**:
- Reads `access_token` cookie; verifies RS256 via `jose` / `jsonwebtoken` (Stage 11); attaches `ctx.user = { id }` on success.
- On expired access token (15min) → returns 401 with cookie unchanged; FE interceptor triggers refresh.
- On any other invalid token → returns 401 and CLEARS both cookies (Set-Cookie Max-Age=0).

### Pattern P-SEC-003: Rate-limit middleware
**Applies to**: NFR-SEC-004 / BR-A06
**Implementation**:
- Applied only to `POST /auth/login`. Uses LC-001 (in-memory map).
- Counter key = lowercased email from the request body (validated upstream).
- On 6th failed attempt within 15 min → 429 with `Retry-After: <seconds-until-oldest-falls-off>`.

### Pattern P-SEC-004: Security response headers
**Applies to**: NFR-SEC-005
**Implementation**:
- A header middleware (executed early) sets on every response:
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (only when `APP_ENV != "dev"`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Tested at Stage 13 (header inspection integration test).

### Pattern P-SEC-005: Cookie helper with environment-aware Secure flag
**Applies to**: NFR-SEC-003 / BR-A10
**Implementation**:
- A single helper `setAuthCookies(res, accessToken, refreshToken)` is the ONLY way auth cookies are set.
- Helper enforces: `HttpOnly`; `SameSite=Lax`; `Path=/`; `Secure` iff `process.env.APP_ENV !== "dev"`.
- Helper has a partner `clearAuthCookies(res)` for logout.
- Compile-time check (TS-only): direct `res.cookie('access_token', ...)` is grep-blocked in CI.

### Pattern P-SEC-006: Account-enumeration-safe error builder
**Applies to**: NFR-SEC-009 / BR-A07
**Implementation**:
- A single function `invalidCredentialsError(request_id)` returns the SAME RFC 7807 envelope for both signup-duplicate and login-fail paths.
- The envelope is BYTE-identical across both paths; only `status` may differ (both default to 401).
- Test: paired integration test asserts identical bodies for `POST /auth/signup` with duplicate email vs `POST /auth/login` with wrong password.

### Pattern P-SEC-007: Refresh-token rotation transaction
**Applies to**: NFR-SEC-010 / BR-A09
**Implementation**:
- The refresh endpoint runs a single DB transaction (READ COMMITTED isolation is sufficient):
  1. SELECT row by token_hash with `FOR UPDATE`.
  2. If `rotated_at IS NOT NULL` → REPLAY: `UPDATE refresh_tokens SET revoked=true WHERE family_id=?`. Commit. Return 401.
  3. Else → `UPDATE current SET rotated_at=now()`. INSERT new row with same `family_id`, parent_id = current.id.
  4. Commit; return new pair via P-SEC-005.

### Pattern P-SEC-008: Log redactor
**Applies to**: NFR-SEC-007 / BR-A12
**Implementation**:
- The Logger (LC-003) ships with a redactor that scans the message's data fields by name (`password`, `passwordHash`, `accessToken`, `refreshToken`, `authorization`, `cookie`, plus a regex on field names matching `/secret|key|token/i`).
- Matching fields are replaced with `"[REDACTED]"` before serialization.
- Test: log-scrape CI test greps for `$argon2id$`, `eyJ` (JWT header), and any plaintext password used in a test fixture; fails if any match leaks into the test logs.

### Pattern P-SEC-009: Password-hash service
**Applies to**: NFR-SEC-001 / BR-A03
**Implementation**:
- Wraps `argon2` (TS/Node) or equivalent with fixed params: `memoryCost=19_456` (19 MiB), `timeCost=2`, `parallelism=1`, `type=argon2id`.
- Two methods only: `hash(plain) → encodedString` and `verify(plain, encodedString) → boolean`.
- Params are read from a frozen `PASSWORD_HASH_PARAMS` constant; never from env.

### Pattern P-SEC-010: JWT signer + JWKS endpoint
**Applies to**: NFR-SEC-002 / BR-A08
**Implementation**:
- JwtSigner loads keys at boot from `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` env vars (PEM).
- Signs access (15-min exp, `aud=auth-api`, `iss=login-account-setup`) and refresh (7-day exp, `aud=auth-refresh`, `iss=login-account-setup`, `family_id` claim).
- Exposes `GET /.well-known/jwks.json` from the in-process public key. Cache-control header: `public, max-age=86400` (24h — Stage 10 Q3=B, **deviated from 1h Recommended**).

---

## Reliability / Observability

### Pattern P-OBS-001: Request-ID middleware
**Applies to**: NFR-OBS-004 / NFR-REL-001
**Implementation**:
- Executed FIRST in the middleware chain.
- Reads incoming `traceparent` (W3C) header → extracts trace id. If absent, generates a UUIDv4.
- Stores on `ctx.request_id`; attaches as `X-Request-Id` response header (always); included in every log line for the request.

### Pattern P-OBS-002: JSON structured logger
**Applies to**: NFR-OBS-001
**Implementation**:
- `pino` (TS/Node Codiste preset; Stage 11 confirms).
- Output to stdout in JSON format. Fields per `aidlc-profile.md`: `timestamp` (ISO 8601), `level` (`debug|info|warn|error|fatal`), `message`, `service` (`login-account-setup-backend`), `version` (from `package.json`), `request_id`, `user_id` (when authenticated), `trace_id`, `span_id`, `environment`.
- Per-request: a start-of-request `info` line + end-of-request `info` line (duration + status).
- Errors include `err.name`, `err.message`, `err.stack` (stack omitted in `APP_ENV=prod`).

### Pattern P-OBS-003: Healthcheck endpoint
**Applies to**: NFR-REL-001
**Implementation**:
- `GET /health` (unauthenticated). No DB roundtrip in v1.
- Returns 200 `{status: "ok", version: <semver>, commit: <git sha or "unknown">}`.

---

## NFR → Pattern coverage matrix

| NFR | Owning pattern(s) | Notes |
|-----|-------------------|-------|
| NFR-PERF-001 | P-PERF-001, P-PERF-002 | latency target |
| NFR-PERF-002 | P-PERF-003 | Lighthouse — FE |
| NFR-PERF-003 | P-SCAL-001 (in-mem note) | single process |
| NFR-SCAL-001/002 | P-SCAL-001 | rate-limit map |
| NFR-AVAIL-001/002 | N/A | learning experiment |
| NFR-SEC-001 | P-SEC-009 | Argon2id service |
| NFR-SEC-002 | P-SEC-010 | RS256 + JWKS |
| NFR-SEC-003 | P-SEC-005 | cookie helper |
| NFR-SEC-004 | P-SEC-003 | rate-limit mw |
| NFR-SEC-005 | P-SEC-004 | security headers |
| NFR-SEC-006 | P-SEC-001 | validation |
| NFR-SEC-007 | P-SEC-008 | log redactor |
| NFR-SEC-008 | (CI pattern in Stage 13) | `npm audit` step |
| NFR-SEC-009 | P-SEC-006 | enumeration-safe builder |
| NFR-SEC-010 | P-SEC-007 | rotation tx |
| NFR-REL-001 | P-OBS-003 | health |
| NFR-REL-002 | (Stage 11 ORM migration tooling) | — |
| NFR-REL-003 | P-RES-002 | fail-fast |
| NFR-REL-004 | P-RES-001 | idempotent logout |
| NFR-OBS-001/002 | P-OBS-002 + P-SEC-008 | JSON + redaction |
| NFR-OBS-003 | deferred to Stage 18 | — |
| NFR-OBS-004 | P-OBS-001 | request id |
| NFR-MAINT-001 | (Stage 11 test runner config) | coverage |
| NFR-MAINT-002 | (Stage 11 lint config) | complexity rule |
| NFR-MAINT-003 | (Stage 11 lint config) | lint clean |
| NFR-MAINT-004 | (Stage 11 dep choice) | pin majors |
| NFR-USE-001/002/003 | (FE component patterns — see frontend-components.md) | — |
| NFR-A11Y-001..A08 | (FE component patterns — see frontend-components.md) | a11y mapping there |
| NFR-TEST-001..006 | (Stage 11 test runner + PBT lib) | — |

Every NFR has either a pattern owner here, a Stage-11 config owner, a Stage-18 owner, or an N/A reason.
