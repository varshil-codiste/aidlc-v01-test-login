# Application Design Plan

**Tier**: Greenfield
**Generated**: 2026-05-12T00:10:00Z

## Plan
- [ ] Choose architectural style (monolith / microservices / hybrid)
- [ ] Decide deployment topology (single binary / multi-service / serverless)
- [ ] Decide API surface(s) (REST / GraphQL / gRPC / WebSocket / mixed)
- [ ] Decide auth strategy (session / JWT / OAuth / passwordless)
- [ ] Decide data store(s) (relational / document / k-v / graph / mixed)
- [ ] Decide cross-stack contract format (OpenAPI / GraphQL SDL / Protobuf / shared TS types)
- [ ] Identify shared cross-stack concerns (i18n, error envelope, pagination, real-time)
- [ ] Confirm Stack Selection deferment (Stage 11 decides FE / BE frameworks)

## Anticipated shape (subject to question-file answers)

Most decisions flow directly from earlier stages:

| Decision | Likely answer | Source |
|----------|----------------|--------|
| Architectural style | **Monolith** (single BE process + single FE app) | ≤ 50 users; thin v1 slice; reference impl |
| Deployment topology | **Multi-service via `docker-compose`**: `db` (Postgres 16) + `backend` + `frontend` | FR-021 (FollowupQ B10=A) |
| API surface | **REST** with JSON | aidlc-profile.md cross_stack.contract_format = OpenAPI 3.1 |
| Auth strategy | **JWT (access 15m / refresh 7d) in HttpOnly cookies; refresh-token rotation; RS256** | FR-007, FR-008 (FollowupQ B1=A) |
| Data store | **PostgreSQL 16** (single instance) | FR-021 + B9=A |
| Cross-stack contract | **OpenAPI 3.1**, source-of-truth in `apps/backend/openapi.yaml` (or equivalent path per Stage 11) | aidlc-profile.md |
| Error envelope | **RFC 7807 `application/problem+json`** | Security baseline + REST best practice |
| Real-time / sync | **N/A** for v1 (no WebSockets, no SSE) | BR § 5 / requirements.md § 5 |
| i18n | **English-only**, copy externalized into constants (not JSX strings) so a future i18n layer drops in cleanly | FR-016 / FollowupQ B11=A; requirements.md § 6 |
| Stack Selection | **Defer to Stage 11** — architecture is framework-neutral; pod chooses per UoW | rule: Stage 11 is per-UoW |

## ADRs to write at Part 2 (Comprehensive depth, optional)

| # | Title | Disposition |
|---|-------|-------------|
| ADR-001 | Use REST + OpenAPI 3.1 over GraphQL for v1 | accept (Codiste preset; FE consumes typed client) |
| ADR-002 | Use HttpOnly cookies (not localStorage) for JWT delivery | accept (NFR-S03) |
| ADR-003 | Use refresh-token rotation with session-family revocation on replay | accept (NFR-S10) |
| ADR-004 | Use Postgres over SQLite for v1 | accept (B9=A — Codiste reference impl) |
| ADR-005 | Single monolithic backend over microservices | accept (≤ 50 users; complexity not justified) |
| ADR-006 | Defer framework choice to Stage 11 | accept (rule) |

## Open Questions
- All Part-1 questions are routine; see `application-design-questions.md`.
