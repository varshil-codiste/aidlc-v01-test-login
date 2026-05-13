# NFR Requirements — auth UoW

**UoW**: `auth`
**Tier**: Greenfield
**Generated at**: 2026-05-12T00:17:00Z
**Sources**: Stage 4 `requirements.md` (31 NFRs); Stage 8 `business-rules.md` (BR-A01..A12); Stage 9 questions (Q1-Q5 all = A).

---

## Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-PERF-001 | API endpoint p95 latency (signup, login, refresh, logout, account-setup, /users/me) | **≤ 200 ms** at ≤ 50 users on docker-compose dev stack | Stage 15 integration suite captures p95 across 100 iterations of each endpoint; CI gate fails if > 200ms |
| NFR-PERF-002 | Frontend Landing route Lighthouse Performance score | ≥ 90 | Run via `lhci autorun` in CI (configured at Stage 11) |
| NFR-PERF-003 | Single-process tolerance | The implementation MUST tolerate a single FE + single BE process; no horizontal-scaling assumptions baked in | Architectural — verified at Stage 13 code review (no clustering libs imported, no sticky-session middleware) |

## Scalability

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-SCAL-001 | Concurrent users target | ≤ 50 internal users; sporadic use | informational |
| NFR-SCAL-002 | Multi-process readiness | Rate-limit counter is in-memory single-process by choice (Stage 8 Q3=A); design notes a Redis switchover path | informational |

## Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-001 | Uptime SLO | **N/A** — learning experiment; no real production deploy |
| NFR-AVAIL-002 | Maintenance window | N/A |

## Security (extension enabled — every rule blocking)

| ID | Requirement | Target | Measurement / Mapping |
|----|-------------|--------|-----------------------|
| NFR-SEC-001 | Password storage | Argon2id, memory ≥ 19 MiB, iterations ≥ 2, parallelism = 1 | BR-A03; PBT NFR-T02a; assertion in unit test |
| NFR-SEC-002 | JWT signing | RS256 only | BR-A08; PBT NFR-T02b |
| NFR-SEC-003 | Cookie flags | `HttpOnly`; `Secure` (non-dev); `SameSite=Lax`; `Path=/` | BR-A10; integration-test reads response headers |
| NFR-SEC-004 | Failed-login rate-limit | 5 attempts / 15-min rolling window per email; 6th attempt = 429 with `Retry-After` | BR-A06; integration test |
| NFR-SEC-005 | Security response headers (all endpoints) | `Content-Security-Policy` strict (no inline scripts); `Strict-Transport-Security` `max-age` ≥ 1 year in prod; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` deny camera/mic/geolocation | header inspection test |
| NFR-SEC-006 | Input validation | Server-side schema validation authoritative (zod / pydantic per Stage 11); FE validation is convenience-only | BR-A01, A04, A05 |
| NFR-SEC-007 | Log redaction | Logs never contain plaintext password, hash, JWT, refresh token, full request body on auth endpoints | BR-A12; log-scrape CI test |
| NFR-SEC-008 | Dependency scan | `npm audit --omit=dev` / `pip-audit` reports ZERO `high` or `critical` findings before Stage 13 PROCEED | CI step |
| NFR-SEC-009 | Account-enumeration defense | Signup-duplicate and wrong-password produce identical RFC 7807 envelopes (single shared error builder) | BR-A07; paired integration test |
| NFR-SEC-010 | Refresh-token rotation + family revoke | Every use rotates; replay revokes whole family | BR-A09; PBT NFR-T02d |

## Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-001 | Health endpoint | `GET /health` returns 200 with JSON `{status: "ok", version, commit}` |
| NFR-REL-002 | Migration versioning | Up + down migrations; rollback documented in `runbook.md` (Stage 16) |
| NFR-REL-003 | Env-var fail-fast | App refuses to start if required env var missing; clear error to stderr |
| NFR-REL-004 | Idempotent logout | `POST /auth/logout` with no cookie returns 204 (not 401) |

## Observability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-OBS-001 | Log format | JSON-structured to stdout; required fields per `aidlc-profile.md` (`timestamp, level, message, service, version, request_id, user_id, trace_id, span_id, environment`) |
| NFR-OBS-002 | No PII in logs | Per NFR-SEC-007 |
| NFR-OBS-003 | Sentry / Datadog | **Deferred** to Stage 18 (Observability light); not wired in v1 |
| NFR-OBS-004 | Request-ID propagation | UUIDv4 or pass-through W3C `traceparent`; emitted on every log line and returned as `X-Request-Id` header |

## Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-MAINT-001 | BE line coverage | ≥ 80% on business-logic modules (Q2=A) |
| NFR-MAINT-002 | Cyclomatic complexity | ≤ 10 per function (Q3=A); lint-enforced |
| NFR-MAINT-003 | Lint clean | `eslint --max-warnings 0` / `ruff check` exit 0 |
| NFR-MAINT-004 | Dependency churn | Pin major versions in `package.json` / `pyproject.toml`; major-version upgrade requires a new UoW |

## Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-USE-001 | Onboarding clicks | First-time-user cold visit → Dashboard in ≤ 4 clicks |
| NFR-USE-002 | Submit-disabled while pending | Sign Up / Sign In / Submit buttons disabled during in-flight submit |
| NFR-USE-003 | Inline error UX | All success/error states inline (no native `alert()`) |

## Accessibility (extension enabled — every rule blocking, WCAG 2.2 AA)

| ID | Requirement | WCAG SC |
|----|-------------|---------|
| NFR-A11Y-001 | All form fields have paired `<label>` (not placeholder-only labels) | 1.3.1, 3.3.2 |
| NFR-A11Y-002 | Visible focus indicators with ≥ 3:1 contrast against surrounding background | 2.4.7, 2.4.11 |
| NFR-A11Y-003 | Color is never the sole indicator (errors include icon + text) | 1.4.1 |
| NFR-A11Y-004 | Contrast ratios: body text ≥ 4.5:1; large text ≥ 3:1 | 1.4.3 — **`#737272` token after Q1 fix** |
| NFR-A11Y-005 | Keyboard navigation: Tab order matches visual order; all flows operable without mouse | 2.1.1, 2.4.3 |
| NFR-A11Y-006 | Each route has unique `<h1>`; errors announced via `aria-live="polite"` | 2.4.2, 4.1.3 |
| NFR-A11Y-007 | Touch targets ≥ 44×44 CSS px | 2.5.8 |
| NFR-A11Y-008 | Inputs link to error messages via `aria-describedby`; enumeration-safe NFR-S09 message is reused on duplicate-email | 3.3.1, 3.3.3 |

## Testability (PBT extension enabled — every property blocking)

| ID | Requirement |
|----|-------------|
| NFR-TEST-001 | BE unit-test coverage ≥ 80% lines |
| NFR-TEST-002 | **Property-based tests** required: |
| (a) | `verify(hash(p)) === true` ∀ `p` length ≥ 12 |
| (b) | `verify(sign(claims)) === claims` (modulo standard JOSE-added fields) |
| (c) | `normalize(normalize(e)) === normalize(e)` (email lowercase idempotence) |
| (d) | refresh-token rotation: N rotations → N+1 distinct tokens; only latest valid; replay → family revoke |
| NFR-TEST-003 | PBT framework: per-stack (`fast-check` for TS, `hypothesis` for Python, `gopter` for Go — Stage 11 confirms) |
| NFR-TEST-004 | Integration tests cover: signup-happy, login-happy, login-rate-limit (5+1=429), account-setup-happy, logout, /health, paired-NFR-S09 |
| NFR-TEST-005 | E2E test (Playwright per Codiste preset, Stage 11 confirms) covers full Landing → Sign Up → Account Setup → Dashboard → Logout flow on Chromium at 1440 + 375 px viewports |
| NFR-TEST-006 | CI green is a Stage 13 PROCEED prerequisite |

## AI/ML Quality

**N/A** — extension opted out (Stage 4 A4=C).

---

## Per-UoW NFR count

| Category | Count |
|----------|-------|
| Performance | 3 |
| Scalability | 2 |
| Availability | 2 (both N/A) |
| Security | 10 |
| Reliability | 4 |
| Observability | 4 |
| Maintainability | 4 |
| Usability | 3 |
| Accessibility | 8 |
| Testability | 6 |
| AI/ML | 0 (extension N/A) |
| **Total** | **46** (Stage 4 restated as 38; Stage 9 added Scal, Maint, USE-001 explicit IDs = 46 final) |

---

## Traceability — every Stage 9 NFR ↔ Stage 4 NFR ↔ Stage 8 BR

| Stage 9 ID | Stage 4 ref | Stage 8 BR |
|------------|-------------|------------|
| NFR-PERF-001 | NFR-P01 | — |
| NFR-PERF-002 | NFR-P02 | — |
| NFR-PERF-003 | NFR-P03 | — |
| NFR-SCAL-001/002 | implied | BR-A06 |
| NFR-AVAIL-001/002 | inferred N/A | — |
| NFR-SEC-001 | NFR-S01 | BR-A03 |
| NFR-SEC-002 | NFR-S02 | BR-A08 |
| NFR-SEC-003 | NFR-S03 | BR-A10 |
| NFR-SEC-004 | NFR-S04 | BR-A06 |
| NFR-SEC-005 | NFR-S05 | — |
| NFR-SEC-006 | NFR-S06 | BR-A01,04,05 |
| NFR-SEC-007 | NFR-S07 | BR-A12 |
| NFR-SEC-008 | NFR-S08 | — |
| NFR-SEC-009 | NFR-S09 | BR-A07 |
| NFR-SEC-010 | NFR-S10 | BR-A09 |
| NFR-REL-001..004 | NFR-R01..R04 | — |
| NFR-OBS-001..004 | NFR-O01..O04 | BR-A12 |
| NFR-MAINT-001..004 | implied | — |
| NFR-USE-001..003 | NFR-U01..U03 | — |
| NFR-A11Y-001..008 | NFR-A01..A08 | — |
| NFR-TEST-001..006 | NFR-T01..T06 | BR-A02, A03, A08, A09 (PBT) |
