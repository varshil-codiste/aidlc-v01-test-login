# NFR Design Checklist — auth UoW

**Generated**: 2026-05-12T00:20:00Z

## Items

### Section 1 — Coverage
- [x] Every NFR has a pattern OR an explicit N/A reason (see `auth-nfr-design-patterns.md` § NFR → Pattern coverage matrix)
- [x] N/A patterns are explicit (retries / circuit breakers / queues / caching / sharding — all explained)
- [x] Every logical component has purpose, type, tech-decision marker, and owning NFR(s)

### Section 2 — Quality
- [x] Patterns are specific enough to implement (no "we'll handle errors")
- [x] No pattern names a specific framework (per ADR-006 deferral) — `pino`, `zod`, `argon2`, `jose` are mentioned as Codiste preset candidates but Stage 11 confirms
- [x] Logical-component graph (Mermaid) + text alternative

### Section 3 — Stage 10 question answers (all 4)
- [x] Q1 DB pool size → A (10)
- [x] Q2 refresh-token cleanup → A (none in v1; runbook)
- [x] Q3 JWKS cache TTL → **B (24h)** — user deviated from Recommended A (1h). Acceptable: key never rotates in v1.
- [x] Q4 approve → A

### Section 4 — Routing
- [x] aidlc-state.md updated — Stage 10 COMPLETE for `auth`
- [x] audit.md updated
- [x] Next stage = Stage 11 — Stack Selection (per-UoW)

## Findings worth surfacing before Stage 11

| # | Finding | Severity | Stage 11 disposition |
|---|---------|----------|----------------------|
| 1 | Backend language is **fixed = TypeScript / Node.js** (Stage 9 Q4=A binding) | DECISION | Stage 11 picks BE framework within TS/Node only |
| 2 | Codiste preset candidates surfaced for each slot — Stage 11 confirms or overrides | INFO | Stage 11 |
| 3 | JWKS cache 24h means a future key rotation requires either 24h drain or a force-refresh path (NOT in v1) | INFO | post-v1 |
| 4 | Direct `pg.Pool` / `res.cookie('access_token', ...)` imports must be CI-blocked outside repository / cookie-helper modules respectively (P-PERF-001 + P-SEC-005) | INFO | Stage 12 codegen plan must include lint rules |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T00:20:00Z | AI-DLC | Initial creation. All sections [x]. 13 patterns + 13 logical components. 4 findings flagged. |
