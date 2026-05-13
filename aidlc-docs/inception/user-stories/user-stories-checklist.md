# User Stories Checklist

**Tier**: Greenfield
**Stories**: 8
**Generated**: 2026-05-12T00:09:00Z

## Items

### Section 1 — Personas
- [x] At least 1 persona identified (1 — `CodisteTeammate`)
- [x] Each persona has Role / Goals / Pain points / Tech savviness / Devices / Locale
- [x] Out-of-scope personas explicitly noted (External customer, Admin, Stakeholder) so we don't accidentally design for them

### Section 2 — Stories (8 total)

Per story: INVEST + acceptance criteria + cross-stack notes + requirement mapping.

| ID | I | N | V | E | S | T | AC ≥ 3 | XS notes | Reqs mapped |
|----|---|---|---|---|---|---|--------|----------|-------------|
| US-001 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (5) | ✓ FE+BE+DB | FR-001…005, NFR-S01, S06, S09, A01, A04, A08, T01 |
| US-002 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (4) | ✓ FE+BE+MW | FR-011…013, NFR-A01, A05 |
| US-003 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (4) | ✓ FE+BE+DB | FR-006…009, NFR-S02, S03, S10, A01, A02 |
| US-004 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (3) | ✓ FE+BE | FR-014, NFR-A05, A06, S03 |
| US-005 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (3) | ✓ FE+BE | FR-015, NFR-S03, S10, A03 |
| US-006 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (6) | ✓ FE+BE | FR-005, 009, 010, 019, NFR-S04, S06, S09, A03, A08, U02, U03 |
| US-007 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (4) | ✓ FE+tooling | NFR-A01..A08 |
| US-008 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (7) | ✓ BE+CI+FE | NFR-S01..S10, T01..T04, T06 |

**INVEST violations**: **none** — all 8 stories pass.
**Acceptance criteria count**: 36 total (minimum 3 per story).
**Cross-stack notes**: all 8 include FE/BE/MW/DB/CI/Tooling notes where relevant.

### Section 3 — Coverage

- [x] Every Tier-1 FR is referenced by at least one story
  - FR-001 → US-001
  - FR-002 → US-001
  - FR-003 → US-001
  - FR-004 → US-001
  - FR-005 → US-001, US-006
  - FR-006 → US-003
  - FR-007 → US-003
  - FR-008 → US-003
  - FR-009 → US-003, US-006
  - FR-010 → US-006
  - FR-011 → US-002
  - FR-012 → US-002
  - FR-013 → US-002
  - FR-014 → US-004
  - FR-015 → US-005
  - FR-016 → US-001 (Landing rendered via signup CTA — visual mapping completed at Stage 6/8)
  - FR-017 → US-007 (font swap surfaces in a11y audit)
  - FR-018 → US-001 (Signup page copy uses corrected text)
  - FR-019 → US-006
  - FR-020 → US-007 (responsive coverage in a11y audit)
  - FR-021 → out of stories — operational; covered by `runbook.md` at Stage 16
  - FR-022 → out of stories — operational; covered by `runbook.md` at Stage 16
- [x] Every NFR Section S / A / T row covered by US-007 or US-008
- [x] No story spans more than one persona (single persona, trivially satisfied)

### Section 4 — Routing
- [x] aidlc-state.md updated to STAGE 5: COMPLETE
- [x] audit.md updated with planning answers and Part-2 generation

## Findings to carry forward

| # | Finding | Severity | Carry to |
|---|---------|----------|----------|
| 1 | FR-021 + FR-022 (docker-compose, runbook test-account cleanup) intentionally not in story form — they are operational | INFO | Stage 16 Deployment Guide / `runbook.md` |
| 2 | US-007 AC #3 forces the `#908d8d` subtitle color fix — same as requirements-analysis-checklist Finding #1 | dependency | Stage 8 Functional Design (token darken to `#737272`) |
| 3 | US-008 names `fast-check` / `hypothesis` / `gopter` — final choice depends on Stack Selection (Stage 11) | INFO | Stage 11 |
| 4 | US-001 AC #4 enforces console-log verification stub shape — Stage 8 must define the exact JSON schema | INFO | Stage 8 |
| 5 | US-006 enforces NFR-S09 enumeration safety via paired byte-identical responses — explicitly testable at Stage 13 | INFO | Stage 13 Code Review (paired-response integration test) |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T00:09:00Z | AI-DLC | Initial generation. 8 stories produced; INVEST pass; 36 acceptance criteria total; 5 carry-forward findings logged. |
