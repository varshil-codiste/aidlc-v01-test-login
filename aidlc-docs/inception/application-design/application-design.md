# Application Design

**Project**: login-account-setup
**Tier**: Greenfield
**Architectural style**: Monolith (single BE + single FE + single Postgres)
**Stacks in scope**: Frontend (Web) + Backend (Node OR Python OR Go — frozen at Stage 11)
**Generated at**: 2026-05-12T00:11:00Z
**Driving artifacts**: BR, requirements.md, design/*, stories.md, application-design-questions.md (all 8 answers = A)

---

## 1. Architecture Overview

```mermaid
flowchart LR
    User["CodisteTeammate\n(browser, ≥1024px / 768 / 375)"] -->|HTTPS in prod, HTTP in dev| FE
    FE["Frontend SPA\n(framework: TBD Stage 11)\nrenders Landing / Signup / AccountSetup / Dashboard\nstoreless — cookies carry auth"]
    FE -->|REST + JSON / cookies| BE
    BE["Backend Monolith\n(framework: TBD Stage 11)\n6 endpoints: /auth/signup, /auth/login, /auth/refresh, /auth/logout, /users/me, /users/me/profile,\n/health, /.well-known/jwks.json"]
    BE -->|SQL via ORM\n(Prisma / SQLAlchemy / sqlc — Stage 11)| DB[("PostgreSQL 16\nusers, refresh_tokens, failed_login_attempts")]
    BE -->|stdout JSON logs| Logs[("Logs\nstdout → docker-compose log driver\n(Sentry/Datadog deferred to Stage 18)")]
    BE -.->|stub: log JSON line, auto-verify| EmailStub["Email Verification Stub\n(stdout only — no real SMTP)"]

    classDef edge fill:#dbeafe,stroke:#2563eb,color:#0a0a0a
    classDef core fill:#dcfce7,stroke:#16a34a,color:#0a0a0a
    classDef store fill:#fef9c3,stroke:#ca8a04,color:#0a0a0a
    classDef stub fill:#f3f4f6,stroke:#9ca3af,color:#0a0a0a,stroke-dasharray: 4 2
    class User,FE edge
    class BE core
    class DB,Logs store
    class EmailStub stub
```

### Text alternative (ASCII)

```
┌─────────────────────┐
│ CodisteTeammate     │
│ (browser)           │
└──────────┬──────────┘
           │ HTTPS prod / HTTP dev
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│ Frontend SPA        │─────▶│ Backend Monolith    │
│ (framework Stage 11)│ REST │ (framework Stage 11)│
│ • Landing           │ +    │ • 8 endpoints       │
│ • Signup            │ JSON │ • Auth middleware   │
│ • AccountSetup      │ +    │ • Rate-limit MW     │
│ • Dashboard         │cookie│ • Request-id MW     │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                          ┌─────────────┼─────────────────┐
                          │             │                 │
                          ▼             ▼                 ▼
                    ┌──────────┐  ┌──────────┐    ┌──────────────┐
                    │Postgres16│  │stdout    │    │Email-stub    │
                    │users     │  │JSON logs │    │(no real SMTP)│
                    │refresh   │  │          │    │              │
                    │_tokens   │  │          │    │              │
                    └──────────┘  └──────────┘    └──────────────┘
```

---

## 2. Cross-Stack Contracts

| Concern | Decision | Source |
|---------|----------|--------|
| API surface | **REST + JSON** | Q3=A |
| Schema source-of-truth | **OpenAPI 3.1** at `apps/backend/openapi.yaml` | Q6=A; aidlc-profile.md |
| FE typed client | Generated from the OpenAPI spec via `openapi-typescript` (or framework-specific tool — chosen at Stage 11) | Q6=A |
| Versioning policy | URL-prefix versioning starting v2 (`/v2/...`). v1 is unprefixed during the learning experiment. | Codiste house default |
| Error envelope | **RFC 7807 `application/problem+json`** with required fields `type`, `title`, `status`, `detail`, and Codiste-house extension `request_id` | Q7=A |
| Pagination | N/A v1 — no list endpoints | requirements.md § 5 |
| Real-time / WebSocket / SSE | N/A v1 | requirements.md § 5 |

### Standard error response shape

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "Field `password` must be at least 12 characters",
  "request_id": "01H..."
}
```

### Standard 429 (rate limit)

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 600
Content-Type: application/problem+json

{
  "type": "https://example.com/errors/rate-limit",
  "title": "Too many attempts",
  "status": 429,
  "detail": "Try again in 10 minutes",
  "request_id": "01H..."
}
```

---

## 3. Auth & Identity

| Aspect | Decision | Source |
|--------|----------|--------|
| Method | JWT access + refresh; both in HttpOnly Secure cookies | Q4=A; FR-007 |
| Signing | RS256 (asymmetric); private key from `JWT_PRIVATE_KEY` env var; JWKS public key endpoint at `/.well-known/jwks.json` | NFR-S02; FR-008 |
| Access token lifetime | 15 minutes | FR-007 |
| Refresh token lifetime | 7 days | FR-007 |
| Refresh token rotation | Every use rotates; old token invalidated; replay revokes the whole session family | NFR-S10 |
| Cookie flags | `HttpOnly; Secure; SameSite=Lax; Path=/` | NFR-S03 |
| Session store | DB-backed (`refresh_tokens` table); no Redis | Q5=A |
| Password hashing | Argon2id (memory ≥ 19 MiB, iterations ≥ 2, parallelism 1) | NFR-S01 |
| Rate-limit store | In-memory map keyed by email (single-process; ≤ 50 users) | FR-010 |
| Account-enumeration defense | Identical response body for duplicate-signup and wrong-password | NFR-S09 |

---

## 4. Data Stores

| Store | Purpose | Stack | Tables |
|-------|---------|-------|--------|
| **PostgreSQL 16** (single instance) | Primary OLTP | BE | `users`, `refresh_tokens`, `failed_login_attempts` (optional — see § Schema) |
| (in-memory) | Rate-limit counter | BE process | (not persistent; single-process state) |
| (stdout) | Logs + email-verification stub | OS / docker | — |
| (none) | Cache / queue / vector / object store | — | none in v1 |

### Schema (logical — physical names per Stage 11 ORM)

```
users
  id                          UUID            PK
  email                       CITEXT          UNIQUE NOT NULL  (case-insensitive)
  display_name                TEXT            NOT NULL
  password_hash               TEXT            NOT NULL
  timezone                    TEXT            DEFAULT 'Asia/Kolkata'
  verified                    BOOLEAN         DEFAULT true     (per stub flow B4=A)
  account_setup_completed     BOOLEAN         DEFAULT false
  created_at                  TIMESTAMPTZ     DEFAULT now()
  updated_at                  TIMESTAMPTZ     DEFAULT now()

refresh_tokens
  id                          UUID            PK
  user_id                     UUID            FK → users.id ON DELETE CASCADE
  family_id                   UUID            NOT NULL
  token_hash                  TEXT            NOT NULL         (SHA-256 of token; never the token itself)
  parent_id                   UUID            NULL FK → refresh_tokens.id
  rotated_at                  TIMESTAMPTZ     NULL
  revoked                     BOOLEAN         DEFAULT false
  expires_at                  TIMESTAMPTZ     NOT NULL
  created_at                  TIMESTAMPTZ     DEFAULT now()
  INDEX (user_id, family_id), INDEX (token_hash) UNIQUE
```

`failed_login_attempts` is **optional** — the in-memory map is sufficient for v1. If we ever scale beyond 1 BE process, switch to Redis (out-of-scope for v1).

### Migrations

Migrations are versioned; convention follows Stage 11 ORM (Prisma `migrate` / Alembic / sqlc + golang-migrate). `runbook.md` will document rollback.

---

## 5. Notable Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Middleware chain** | Backend request pipeline | Request-ID → Logger → CORS → Auth → Rate-limit → Validation → Controller |
| **Repository pattern** | Backend data access | Decouple controllers/services from ORM; testable in isolation |
| **DTOs + schema validation** | Backend boundary | Server-side schema validation is authoritative (NFR-S06); reject extra fields |
| **HTTP-only cookie auth** | FE ↔ BE | FE never reads tokens (NFR-S07) |
| **Silent refresh interceptor** | FE HTTP client | On 401, the interceptor calls `/auth/refresh`, retries the original request once, and only fails if refresh also returns 401 |
| **Route guards** | FE | `account_setup_completed` gating; unauthenticated → Landing |
| **OpenAPI-driven typed client** | FE | Spec is BE source of truth; FE consumes generated types |
| **JSON structured logging** | BE | NFR-O01 — all logs follow `aidlc-profile.md` field list |

---

## 6. ADRs (Architecture Decision Records)

### ADR-001 — REST + OpenAPI 3.1 over GraphQL for v1
**Status**: Accepted (2026-05-12)
**Context**: API surface choice for a thin auth slice.
**Decision**: REST + OpenAPI 3.1 with code-generated TS client.
**Consequences**: ✅ Matches Codiste preset; simpler for ≤ 6 endpoints; lower learning-curve for the team. ❌ Multiple round-trips needed for complex screens — N/A in v1.
**Signed**: Tech Lead Chintan (via Gate #2 signature).

### ADR-002 — HttpOnly cookies (not localStorage) for JWT delivery
**Status**: Accepted (2026-05-12)
**Context**: How does the browser carry the access/refresh token.
**Decision**: HttpOnly + Secure + SameSite=Lax cookies for both tokens.
**Consequences**: ✅ Tokens are invisible to JS — eliminates an entire class of XSS-exfiltration risk (NFR-S03). ❌ Cross-origin sharing requires careful CORS — handled (single-origin in dev).
**Signed**: Gate #2.

### ADR-003 — Refresh-token rotation with session-family revocation on replay
**Status**: Accepted (2026-05-12)
**Context**: Mitigating refresh-token theft.
**Decision**: Each refresh use rotates the token. If an old refresh token is ever presented again, the whole session family is revoked.
**Consequences**: ✅ A stolen token only works once before the legitimate user's next refresh invalidates the family (NFR-S10). ❌ Slightly more DB writes per request; trivial at v1 scale.
**Signed**: Gate #2.

### ADR-004 — PostgreSQL over SQLite for v1
**Status**: Accepted (2026-05-12)
**Context**: Backing store for a learning experiment that should double as a reference impl.
**Decision**: Postgres 16 single instance via docker-compose.
**Consequences**: ✅ Reference impl matches Codiste production stack; concurrent-safe; CITEXT for case-insensitive email. ❌ Slightly heavier dev setup than SQLite — accepted.
**Signed**: Gate #2.

### ADR-005 — Single monolithic backend over microservices
**Status**: Accepted (2026-05-12)
**Context**: ≤ 50 users, 6 endpoints.
**Decision**: Single monolithic BE.
**Consequences**: ✅ No service-mesh / inter-service auth / saga complexity. ❌ Future split (e.g., extract `/users` to its own service) would require refactor — accepted, deferred.
**Signed**: Gate #2.

### ADR-006 — Defer framework choice to Stage 11
**Status**: Accepted (2026-05-12)
**Context**: Should the architecture document name the FE / BE frameworks?
**Decision**: No. Architecture is framework-neutral; Stage 11 chooses per UoW.
**Consequences**: ✅ Pod retains agility at Stage 11 to pick Codiste preset (Next.js + NestJS) OR deviate (e.g., plain React + FastAPI). ❌ Component table below uses generic names (`AuthController`, not `AuthController.ts` / `routers/auth.py`).
**Signed**: Gate #2.

---

## 7. Cross-Stack Edge Catalog (every edge has a contract)

| Edge | Direction | Contract |
|------|-----------|----------|
| FE.AuthGuard ↔ BE.AuthController | FE → BE | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` (OpenAPI § auth) |
| FE.UserDashboard ↔ BE.UserController | FE → BE | `GET /users/me` (OpenAPI § users) |
| FE.AccountSetupPage ↔ BE.UserController | FE → BE | `PATCH /users/me/profile` (OpenAPI § users) |
| FE.HealthCheck ↔ BE.HealthController | FE → BE (CI-only) | `GET /health` (OpenAPI § ops) |
| FE.AuthClient ↔ BE.JwksController | FE → BE (rare — only for internal token verification) | `GET /.well-known/jwks.json` (OpenAPI § ops) |
| BE.UserService → DB.users | BE → Postgres | SQL via ORM (Stage 11) |
| BE.RefreshTokenService → DB.refresh_tokens | BE → Postgres | SQL via ORM |
| BE.EmailStub → stdout | BE → OS | Single JSON line `{to, subject, body, verificationToken}` |
| BE.Logger → stdout | BE → OS | JSON per `aidlc-profile.md` log-required-fields list |

---

## 8. Out-of-scope (v1)

Per BR § 1.4 and requirements.md, the following are **explicitly out of scope** for v1; the architecture must NOT pre-foreclose them but neither does it implement them:

- Real email-sending (SMTP / Resend / Postmark / SES)
- Password reset flow
- OAuth / social login
- MFA / TOTP / SMS
- Admin UI
- Account deletion (GDPR-style erasure)
- Profile picture upload
- I18n (architecture must keep copy externalizable for later)
- Mobile native app
- Multi-tenancy / org membership
- Redis / cache / queue
- Sentry / Datadog wiring (Stage 18 will revisit)
