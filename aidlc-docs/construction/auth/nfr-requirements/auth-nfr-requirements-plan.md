# NFR Requirements Plan — auth UoW

**UoW**: `auth`
**Tier**: Greenfield
**Generated**: 2026-05-12T00:16:00Z
**Driving artifacts**: requirements.md (31 NFRs already drafted at Stage 4), functional-design/business-rules.md, application-design/services.md (env vars + cookie flags).

## Plan
- [ ] Restate the 31 Stage-4 NFRs as per-UoW NFR rows with explicit IDs in the Stage-9 namespace (`NFR-PERF-001` etc.)
- [ ] Add concrete measurement methods to each NFR (where missing)
- [ ] Derive tech-stack constraints implied by NFRs into `auth-tech-stack-decisions.md`
- [ ] Confirm with a tight Part-1 question file: only the few targets not nailed at Stage 4

## Anticipated category coverage

| Category | NFRs counted | Source |
|----------|---------------|--------|
| Performance | 3 (NFR-P01..P03) | requirements.md |
| Scalability | 0 explicit — implied (NFR-P03 says ≤ 50 users, single-process) | — |
| Availability | 0 — N/A for v1 (no real prod) | — |
| Security | 10 (NFR-S01..S10) | requirements.md + Stage-8 BR-A03..A12 |
| Reliability | 4 (NFR-R01..R04) | requirements.md |
| Observability | 4 (NFR-O01..O04) | requirements.md |
| Maintainability | covered by NFR-R04 lint + NFR-T01..T06 testability | requirements.md |
| Usability | 3 (NFR-U01..U03) | requirements.md |
| Accessibility | 8 (NFR-A01..A08) | requirements.md |
| Testability | 6 (NFR-T01..T06) | requirements.md |
| AI/ML Quality | **N/A** — extension opted out (A4=C) | — |

**Total**: 38 NFRs after restatement (vs 31 at Stage 4 — the delta is 7 covered-elsewhere rules now made explicit).

## Open items for Part-1 questions

| # | Item | Source |
|---|------|--------|
| 1 | Concrete p95 latency target (200ms? Stricter? Looser for dev compose?) | NFR-P01 |
| 2 | Coverage % floor (80%? Stricter?) | NFR-T01 |
| 3 | Cyclomatic-complexity ceiling | not previously fixed |
| 4 | Dependency-churn tolerance | not previously fixed |
| 5 | Tech-stack constraint surface — which backend language preference informs Stage 11? | open |
