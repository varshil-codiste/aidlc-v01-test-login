# Requirements

**Project**: login-account-setup
**Tier**: Greenfield
**Depth**: Comprehensive
**Created**: 2026-05-12T00:07:00Z
**Sources**: `business-requirements.md`, `design/branding.md`, `design/design-tokens.md`, `design/screen-flow-map.md`, `requirement-verification-questions.md`

---

## 1. Intent Analysis

| Aspect | Value |
|--------|-------|
| Request type | New project / new product (Greenfield) |
| Scope | Full-stack web — FE + BE + DB. ≤ 50 internal users. |
| Complexity | Simple-to-moderate — well-trodden email+password auth + JWT + thin account-setup form |
| Risk | **LOW** for v1 (internal only, no real PII beyond email + hash, no external integrations). Will escalate to MEDIUM if anyone re-uses this on a client engagement; that becomes a new project under AI-DLC. |

No depth upgrade triggered (risk not high; reversibility OK; no multi-team handoff; AI/ML opted out).

---

## 2. Functional Requirements

### Identity & Registration

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-001** | A new user can register with `email` (unique), `display_name`, and `password` (≥ 12 chars). | BR § 2.8; FollowupQ B2=A |
| **FR-002** | The system hashes the password with **Argon2id** before persistence; plaintext is never stored or logged. | BR § 3.4; FollowupQ B2=A |
| **FR-003** | On successful registration, the system writes a "verification email" event as a single JSON line to stdout — `{to, subject, body, verificationToken}` — and **immediately auto-marks the account as `verified=true`** (stub flow, no token-check page). | FollowupQ B4=A |
| **FR-004** | The signup endpoint returns the new user record (no password fields), a signed access token (cookie), and redirects the client to the Account Setup screen. | FollowupQ B6=A |
| **FR-005** | Duplicate `email` registration returns a generic "email or password invalid" error (does NOT confirm or deny email exists). | Security extension SEC-09 (account enumeration); inferred |

### Login

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-006** | A registered user can log in with `email` + `password`. (UI labels the field "Email" overriding Figma copy "Username".) | BR § 2.8; design open-Q #2; FollowupQ B6=A |
| **FR-007** | On successful login, the system issues a **JWT access token** (15 min) and **refresh token** (7 days), both as HTTP-only, Secure, SameSite=Lax cookies. Refresh-token **rotates on every use** (rotation = old token invalidated, new token issued). | FollowupQ B1=A; aidlc-profile.md conventions.jwt_algorithm |
| **FR-008** | The JWT is signed with **RS256** (asymmetric); the private key is loaded from an env var at startup; the public key is exposed at a `/.well-known/jwks.json` endpoint for any internal consumer. | aidlc-profile.md conventions.jwt_algorithm |
| **FR-009** | Failed-login responses return a generic "email or password invalid" error and do NOT reveal whether the email exists. | FR-005 family; Security extension SEC-09 |
| **FR-010** | After **5 failed login attempts on the same email within a 15-minute window**, further attempts are rejected with a 429 response (rate-limit) until the window expires. Counter is in-memory (single-process; acceptable for ≤ 50 users); on multi-process deployment we will switch to Redis. | FollowupQ B3=A |

### Account Setup

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-011** | After signup (FR-004) the user is presented with an **Account Setup** form with two fields: `display_name` (pre-filled from signup) and `timezone` (dropdown, default `Asia/Kolkata`). | FollowupQ B5=A |
| **FR-012** | Submitting the Account Setup form updates the user record, sets `account_setup_completed=true`, and redirects to the Dashboard. | FollowupQ B5=A |
| **FR-013** | If the user is logged in but `account_setup_completed=false`, any request to a non-setup route redirects back to the Account Setup form. | inferred — onboarding gating |

### Dashboard & Logout

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-014** | The Dashboard displays "Hello, {display_name}" plus a Logout button. (No other features in v1.) | screen-flow-map.md screen 4; BR scope |
| **FR-015** | Logout clears both auth cookies, redirects to Landing, and shows a transient "Signed out" toast. | FollowupQ B7=A |

### UI / Visual

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-016** | The Landing screen renders the 50/50 split layout from Figma (left panel `#016097` brand + single "Sign Up" CTA; right panel logo + Sign In form). The two Figma CTAs collapse to **one** "Sign Up" button. | FollowupQ B6=A; design/screen-flow-map.md |
| **FR-017** | The implementation uses tokens from `design/design-tokens.md`. **Avenir is replaced by `Inter`** at the font-family level; the swap is documented in code. | FollowupQ B11=A; design/branding.md |
| **FR-018** | Two typos in Figma copy are fixed in implementation: `Recieved` → `Received`, `expeirence` → `experience`. | design open-Q #7 |
| **FR-019** | All UI forms emit visible inline error messages on validation failure; error text uses the provisional `danger` color (`#dc2626`) since Figma did not supply one. | design/design-tokens.md § Semantic colors |
| **FR-020** | Responsive: side-by-side at `≥ 1024px`; 60/40 at `≥ 768px`; stacked single-column at `< 768px` (brand panel collapses to a slim header strip). | design/design-tokens.md § Responsive notes |

### Operations

| ID | Requirement | Source |
|----|-------------|--------|
| **FR-021** | The dev environment runs via `docker-compose up`: services = `db` (Postgres 16), `backend`, `frontend`. | FollowupQ B10=A |
| **FR-022** | Test-account cleanup uses `docker-compose down -v`; documented in `operations/runbook.md`. No `/admin/wipe-test-accounts` endpoint. | FollowupQ B12=A |

---

## 3. Non-Functional Requirements

### Security (Security Baseline extension — ENABLED)

| ID | Requirement | Source / Mapping |
|----|-------------|------------------|
| **NFR-S01** | Passwords are hashed with **Argon2id** (memory ≥ 19 MiB, iterations ≥ 2, parallelism = 1; defaults of the `argon2` lib are sufficient). | FR-002; SEC baseline (password storage) |
| **NFR-S02** | JWTs use **RS256**; private key is loaded from `JWT_PRIVATE_KEY` env var; never logged. | FR-008; SEC baseline (crypto agility) |
| **NFR-S03** | Auth cookies are `HttpOnly`, `Secure`, `SameSite=Lax`. `Path=/`. | FR-007; SEC baseline (cookie flags) |
| **NFR-S04** | Failed-login counter triggers a **429 with `Retry-After`** header after 5 attempts in 15 min. | FR-010; SEC baseline (brute-force) |
| **NFR-S05** | Standard security headers on every response: `Content-Security-Policy` (strict; no inline scripts), `Strict-Transport-Security` (max-age ≥ 1 year in prod), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/microphone/geolocation). | SEC baseline (response headers) |
| **NFR-S06** | All input is validated server-side with a schema library (zod / pydantic per Stack Selection). Client-side validation is convenience only; server-side is authoritative. | SEC baseline (input validation) |
| **NFR-S07** | No PII (email, hashed password, display_name) appears in logs. Audit-log events that mention a user use `user_id` (UUID) only. | NFR-O02; SEC baseline (sensitive-data logging) |
| **NFR-S08** | Dependency vulnerabilities: `npm audit` / `pip-audit` (whichever stack) MUST report ZERO `high` or `critical` findings before Code Review (Stage 13) emits PROCEED. | SEC baseline (supply chain); Stage 13 |
| **NFR-S09** | Account-enumeration defense: signup with an existing email and login with a wrong password return identical-looking error responses. | FR-005, FR-009; SEC baseline (enumeration) |
| **NFR-S10** | Refresh-token rotation: every use of a refresh token immediately invalidates it server-side; if the same refresh token is presented twice (replay), the user's entire session family is revoked. | FR-007; SEC baseline (session) |

### Accessibility (WCAG 2.2 AA extension — ENABLED)

| ID | Requirement | Source / Mapping |
|----|-------------|------------------|
| **NFR-A01** | All form fields have associated `<label>` elements (not placeholder-only labels). Placeholder text from Figma becomes the label. | WCAG 1.3.1, 3.3.2 |
| **NFR-A02** | All interactive elements (`button`, `a`, inputs) have visible focus styles with ≥ 3:1 contrast against the surrounding background. | WCAG 2.4.7, 2.4.11 |
| **NFR-A03** | Color is never the sole indicator of state (errors, success). Icon + text accompanies any color cue. | WCAG 1.4.1 |
| **NFR-A04** | Color contrast: text vs background ≥ 4.5:1 (normal), ≥ 3:1 (large). Verify token combinations: `#2c2b2b` on `#ffffff` (heading), `#908d8d` on `#ffffff` (subtitle ← **flagged: 4.0:1 — fails AA for body text**, must darken to `#737272` or larger size only). | WCAG 1.4.3 — **needs fix at Stage 8** |
| **NFR-A05** | Keyboard navigation: Tab traversal order matches visual order (Landing: Sign Up → Email → Password → Sign In; Account Setup: display_name → timezone → Submit). All actions are operable without a mouse. | WCAG 2.1.1, 2.4.3 |
| **NFR-A06** | Screen-reader semantics: each route emits a unique `<title>`; the form `<h1>` matches the page's purpose; errors are announced via `aria-live="polite"` regions. | WCAG 2.4.2, 4.1.3 |
| **NFR-A07** | Touch targets ≥ 44×44 CSS px (Figma buttons are 56–62px tall — passes; smaller icon-only controls must be padded). | WCAG 2.5.8 |
| **NFR-A08** | All form inputs surface clear error messages via `aria-describedby` and inline; "email already in use" is rephrased to the enumeration-safe message per NFR-S09. | WCAG 3.3.1, 3.3.3 |

### Performance & Scalability

| ID | Requirement |
|----|-------------|
| **NFR-P01** | API latency (login, signup, account-setup) at the p95 ≤ 200 ms on the dev compose stack with ≤ 50 users. (No real load testing required for v1.) |
| **NFR-P02** | Frontend Lighthouse Performance score on the Landing route ≥ 90 in `docker-compose` dev environment. |
| **NFR-P03** | The implementation MUST tolerate a single FE + single BE process. No horizontal-scaling assumptions baked in. |

### Reliability & Maintainability

| ID | Requirement |
|----|-------------|
| **NFR-R01** | Backend health endpoint at `GET /health` returns 200 with JSON body `{status: "ok", version, commit}`. |
| **NFR-R02** | Database migrations are versioned (Prisma migrate or Alembic per stack). Rollback at least one migration is documented. |
| **NFR-R03** | All env vars consumed by FE / BE are listed in `.env.example` with non-secret placeholders. The app fails fast on startup if a required env var is missing. |
| **NFR-R04** | Code style: linter passes with zero errors. Codiste lint: ESLint+Prettier (Node) or ruff (Python). |

### Observability

| ID | Requirement | Source |
|----|-------------|--------|
| **NFR-O01** | All backend logs are JSON-structured to stdout with the required fields from `aidlc-profile.md` (`timestamp, level, message, service, version, request_id, user_id, trace_id, span_id, environment`). | FollowupQ B8=A; aidlc-profile.md |
| **NFR-O02** | Logs MUST NOT contain plaintext passwords, JWTs, refresh tokens, or full request bodies for auth endpoints. | NFR-S07 |
| **NFR-O03** | Sentry / Datadog wiring is **deferred** to Stage 18 (Observability Setup); decision is "only if needed for the experiment". | FollowupQ B8=A |
| **NFR-O04** | Every request carries a `request_id` (W3C `traceparent` if present, otherwise generated UUIDv4). This id flows through logs and is returned in the response header for client correlation. | NFR-O01 |

### Testability (Property-Based Testing extension — ENABLED ⚠️ user-deviated to YES)

| ID | Requirement |
|----|-------------|
| **NFR-T01** | Unit-test coverage on the backend ≥ 80% lines for business logic modules (excluding generated code and DTOs). |
| **NFR-T02** | **Property-based tests** (per the PBT extension; user opted-in A3=A) MUST exist for the following invariants: |
| | (a) Password-hash round-trip: `verify(hash(p)) == true` for any `p` of length ≥ 12 |
| | (b) JWT round-trip: `verify(sign(claims)) == claims` for any well-formed claims |
| | (c) Email-normalization idempotence: `normalize(normalize(e)) == normalize(e)` |
| | (d) Refresh-token rotation: rotating a refresh token N times produces N+1 distinct tokens, only the latest is valid |
| **NFR-T03** | Property-based test framework: per stack — `fast-check` (TS/Node), `hypothesis` (Python), `gopter`/`testing/quick` (Go). |
| **NFR-T04** | Integration tests cover: signup happy path, login happy path, login rate-limit triggering at 5/15min, account-setup happy path, logout, /health. |
| **NFR-T05** | E2E test (Playwright or equivalent at Stage 11) covers the full Landing → Sign Up → Account Setup → Dashboard → Logout flow on Chromium at 1440 + 375 px viewports. |
| **NFR-T06** | All tests run in CI (`docker-compose -f compose.ci.yml`) — green run is a Stage 13 PROCEED prerequisite. |

### Usability & UX

| ID | Requirement |
|----|-------------|
| **NFR-U01** | First-time-user flow (cold visit → registered + at Dashboard) requires ≤ 4 clicks. |
| **NFR-U02** | Sign Up and Sign In buttons show a disabled state while submitting (no double-submit). |
| **NFR-U03** | All success / error states are surfaced inline (no native `alert()` boxes). |

---

## 4. User Scenarios

### 4.1 Happy paths

| # | Scenario | Steps |
|---|----------|-------|
| H1 | New user signs up | Landing → click "Sign Up" → fill `email`, `display_name`, `password (≥12)` → submit → see Account Setup → fill `display_name` (pre-filled), pick `timezone` → submit → land on Dashboard "Hello, {display_name}" |
| H2 | Returning user logs in | Landing → fill Email + Password → click Sign In → land on Dashboard |
| H3 | User logs out | Dashboard → click Logout → back to Landing → see "Signed out" toast |
| H4 | Account-setup gating | Sign up but DON'T submit Account Setup → try to visit Dashboard → redirected back to Account Setup |

### 4.2 Edge cases

| # | Scenario | Expected |
|---|----------|----------|
| E1 | Email format invalid at signup | Inline error "Email must be a valid email address"; submit disabled until fixed |
| E2 | Password < 12 chars | Inline error "Password must be at least 12 characters"; submit disabled |
| E3 | Email already registered | Generic "email or password invalid" error (no enumeration) — NFR-S09 |
| E4 | Wrong password on login | Same generic error — NFR-S09 |
| E5 | 5th failed login in 15 min | 429 response with Retry-After; UI shows "Too many attempts. Try again in N minutes." |
| E6 | Refresh token replay (same token used twice) | Server invalidates entire session family; user must re-login (NFR-S10) |
| E7 | Access token expired (after 15 min) | Browser silently uses refresh token to get a new access token; user sees no interruption |
| E8 | Refresh token also expired (after 7 days) | User is logged out, redirected to Landing |
| E9 | Account setup incomplete + token still valid | Any non-setup route redirects to Account Setup |
| E10 | User has account setup completed; visits Account Setup route | Redirected to Dashboard |

### 4.3 Error scenarios

| # | Scenario | Expected |
|---|----------|----------|
| X1 | DB unreachable on signup | 503 Service Unavailable; UI shows "Sorry — something went wrong. Try again." |
| X2 | Required env var missing on startup | Backend refuses to start; logs a clear error message |
| X3 | Invalid JWT presented (tampered) | 401; cookie cleared |
| X4 | Cookie missing on protected route | 401; redirect to Landing |
| X5 | Non-JSON body on a JSON endpoint | 400 with content-type guidance |

---

## 5. Full-Stack Coordination

| Concern | Decision |
|---------|----------|
| **Shared schemas** | API contract documented in **OpenAPI 3.1** (`docs/openapi.yaml`). Generated TS client used by the FE. (Stack details at Stage 11.) |
| **Authentication boundary** | Browser ↔ BE via HTTPS in prod, HTTP in compose. Cookies (HttpOnly) carry auth. FE never reads the token. |
| **CORS** | BE allows the FE origin only (`http://localhost:3000` in dev, configurable via env). |
| **Time** | Server time is UTC. User's `timezone` is stored on the user record but **never used to render dates in v1** (no dates in v1 UI beyond "Hello, {name}"). |
| **No real-time / offline / sync requirements** in v1. |

---

## 6. Quality Attributes Summary

| Attribute | Target |
|-----------|--------|
| Accessibility | WCAG 2.2 AA (per NFR-A0x) |
| Internationalization | English only; copy externalized into constants so an i18n layer can be inserted later without refactoring |
| Documentation | `README.md` with quickstart + `runbook.md` + this file |
| Security posture | Codiste SEC Baseline (15 rules) — see NFR-S0x |
| Testability | Unit + Integration + E2E + Property-based — see NFR-T0x |
| Observability | JSON structured logs (NFR-O0x); Sentry/Datadog deferred |

---

## 7. Extension Configuration Summary

| Extension | Enabled | Notes |
|-----------|---------|-------|
| Security Baseline | ✅ Yes (A1=A) | Full ruleset (15 rules); blocking at Stages 8/10/12/13/19 |
| Property-Based Testing | ✅ Yes (A3=A — user deviated from Recommended C) | Full ruleset; blocking at Stages 12 (Codegen plan) & 13 (Code Review); see NFR-T02/T03 |
| AI/ML Lifecycle | ❌ No (A4=C) | Rule file never loaded |
| Accessibility (WCAG 2.2 AA) | ✅ Yes (A2=A) | Full ruleset; blocking at Stages 8/12/13/15/19; see NFR-A0x |

---

## 8. Traceability Matrix

| Requirement ID | Source(s) | Acceptance Criteria (will be refined at Stage 8) |
|----------------|-----------|---------------------------------------------------|
| FR-001 | BR § 2.8; B2=A | Submitting valid signup payload returns 201 + user record (no password fields) |
| FR-002 | BR § 3.4 | DB row has `password_hash` starting with `$argon2id$`; plaintext never appears in logs |
| FR-003 | B4=A | Stdout contains a JSON line with the verification fields; `users.verified = true` immediately after signup |
| FR-004 | B6=A | Response sets `access_token` + `refresh_token` cookies; HTTP 302 to `/account-setup` |
| FR-005 | NFR-S09 | Same response body & status for unknown vs known email |
| FR-006 | BR § 2.8; design open-Q #2 | UI label is "Email", `name` attribute is `email`, server validates `email` format |
| FR-007 | B1=A | Successful login sets both cookies; refresh-token row in DB has `rotation_id` |
| FR-008 | aidlc-profile.md | `/.well-known/jwks.json` returns a valid JWK set; JWT header `alg=RS256` |
| FR-009 | NFR-S09 | Same as FR-005 |
| FR-010 | B3=A | 6th failed attempt within 15 min returns 429 with `Retry-After` |
| FR-011 | B5=A | Account Setup page renders 2 fields; timezone dropdown contains IANA names; default = `Asia/Kolkata` |
| FR-012 | B5=A | Submitting sets `account_setup_completed=true`; redirects to Dashboard |
| FR-013 | inferred | E2E test: signup → manual GET /dashboard → 302 to /account-setup |
| FR-014 | screen-flow-map | Dashboard shows display_name; Logout button present |
| FR-015 | B7=A | Logout clears cookies; redirects to /; toast renders for 5s |
| FR-016 | B6=A; design | Visual diff of Landing against Figma at 1440 (allowing typography swap to Inter) |
| FR-017 | B11=A | computed CSS shows `font-family: Inter,...`; Avenir NOT loaded |
| FR-018 | design open-Q #7 | Page source contains "Received" / "experience" |
| FR-019 | design tokens | Error text in implementation uses `#dc2626` (or token `danger.500`) |
| FR-020 | design tokens | Resize browser through 1440 → 1024 → 768 → 375; layout follows the responsive rules |
| FR-021 | B10=A | `docker compose up` from a clean clone brings up all 3 services; FE reachable on localhost:3000 |
| FR-022 | B12=A | `docker compose down -v` followed by `up` yields zero users |
| NFR-S01 | A1=A; B2=A | Hash format check in test |
| NFR-S02 | aidlc-profile.md | Decode header.alg test in test |
| NFR-S03 | B1=A | Integration test reads response headers and asserts all flags |
| NFR-S04 | B3=A | E2E test simulates 5 fails → 6th = 429 |
| NFR-S05 | SEC baseline | Integration test inspects response headers |
| NFR-S06 | SEC baseline | Invalid payload returns 400 with field-level errors |
| NFR-S07 | SEC baseline | Log-scrape test asserts no plaintext password / token strings |
| NFR-S08 | SEC baseline | CI step runs `npm audit --omit=dev` / `pip-audit`; fails on high|critical |
| NFR-S09 | SEC baseline | Same response check (paired test) |
| NFR-S10 | SEC baseline | Two-use refresh test asserts whole-family revoke |
| NFR-A01 to NFR-A08 | A2=A; WCAG 2.2 AA | axe-core scan in E2E test + manual checklist at Stage 14 |
| NFR-T01 to NFR-T06 | A3=A; PBT extension | Coverage report; property-based test files present; E2E runs in CI |
| NFR-P01, NFR-P02 | inferred | Local timing harness in test; Lighthouse run via puppeteer in CI |
| NFR-R01 to NFR-R04 | inferred | Endpoint test; migration up/down test; env-var-missing test; lint clean |
| NFR-O01 to NFR-O04 | B8=A; aidlc-profile.md | Log-shape test (assert required fields present) |

---

## 9. Open Questions Carried Forward

| # | Item | Deferred to | Why |
|---|------|-------------|-----|
| 1 | NFR-A04: `#908d8d` body subtitle on `#ffffff` is **4.0:1 contrast (fails AA)** | Stage 8 Functional Design | Need to either darken token to `#737272` (≈ 4.6:1) or only use this color for non-body text. Designer should confirm. |
| 2 | FR-008 RS256 keypair generation flow | Stage 11 Stack Selection / Stage 12 Codegen | One-time bootstrap script `bin/gen-keys.sh` is the Codiste house convention. |
| 3 | NFR-T05 E2E framework choice (Playwright vs Cypress) | Stage 11 Stack Selection | Codiste-house default is Playwright. |
| 4 | Specific FE + BE frameworks | Stage 11 Stack Selection | Codiste preset suggests Next.js + NestJS but pod decides per-UoW. |
| 5 | One UoW or two? | Stage 7 Workflow Planning § Units Generation | Likely two: `backend-auth` UoW + `frontend-auth` UoW, with Postgres baked into backend. |
| 6 | Logo inverted variant + favicon | Stage 6 Application Design | Whether to request from team lead or use a placeholder. |
| 7 | Whether to add an OpenAPI-generated TS client at Stage 11 | Stage 11 | Codiste convention is yes; small projects can skip. |
