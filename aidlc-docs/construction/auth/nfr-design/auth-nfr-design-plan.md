# NFR Design Plan — auth UoW

**UoW**: `auth`
**Tier**: Greenfield
**Generated**: 2026-05-12T00:19:00Z

## Plan
- [ ] Map each NFR to a concrete pattern OR mark N/A with reason
- [ ] List logical components (rate-limit map, request-id middleware, log redactor, JWKS cache, cookie helper, password-hash service, refresh-token rotation service)
- [ ] Defer all framework choices to Stage 11 (per ADR-006)

## Anticipated shape

Many resilience / scalability / async patterns are **N/A for this thin slice** because:
- No external integrations (BR Q9=A) → no retries / circuit breakers / timeouts beyond DB defaults
- ≤ 50 internal users (NFR-SCAL-001) → no caching, no read-replicas, no horizontal scaling
- No queue / DLQ / scheduler needed (the email-stub is a synchronous stdout write)

Patterns that **do** apply:
- **Performance**: DB connection pool (ORM default; size = 10)
- **Security**: input-validation middleware (zod / pydantic), authN middleware (cookie+RS256-verify), audit logger (JSON + redaction), CSP+HSTS header middleware, rate-limit middleware (in-memory)
- **Reliability**: idempotent `/auth/logout`, fail-fast env-var loading, healthcheck endpoint
- **Observability**: request-id propagation, JSON structured logs, log redaction

Logical components that exist:
- LC-001 Rate-limit in-memory map
- LC-002 Request-id middleware
- LC-003 JSON Logger w/ redactor
- LC-004 Cookie helper
- LC-005 Password Hash service (Argon2id)
- LC-006 JWT signer + JWKS cache
- LC-007 Refresh-token rotation tx
- LC-008 Email stub
- LC-009 Health check endpoint
- LC-010 Validation middleware (zod-style)
- LC-011 Auth middleware (verify access cookie)
- LC-012 Error envelope middleware (RFC 7807)

## Open items (small set of confirmations only — see `auth-nfr-design-questions.md`)
1. DB connection pool size — 10 (Codiste default) vs other?
2. Refresh-token cleanup cadence — none (v1 lets rows accumulate) vs daily cron?
3. JWKS public-key cache TTL — 1h (Codiste default) vs other?
4. Approval to generate Part 2 patterns + components
