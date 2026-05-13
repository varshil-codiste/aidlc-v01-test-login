# Grill-Me #2 Plan — auth

**UoW**: auth     **Tier**: Greenfield     **Generated at**: 2026-05-12T17:58:00+05:30
**Question count**: 12     **Pass threshold**: 0.85
**Manual QA iteration**: 1 of max 3 (cycle 1 reached all-PASS after fixing 15 bugs + accepting 1)

## Source artifacts cited in question stems
- `aidlc-docs/construction/auth/functional-design/business-rules.md` (BR-A01..BR-A12)
- `aidlc-docs/construction/auth/nfr-requirements/auth-nfr-requirements.md` (NFR-S01..S10, NFR-T02a-d, NFR-MAINT-001)
- `aidlc-docs/construction/auth/code/auth-code-summary.md` (built files / decisions)
- `aidlc-docs/construction/auth/code-review/auth-code-review-report.md` (cycle-1 synthesis)
- `aidlc-docs/construction/auth/code-review/auth-test-report.md` (cycle-1 actual run data)
- `aidlc-docs/construction/auth/code-review/auth-security-report.md` (cycle-1 with BUG-010 acceptance)
- `aidlc-docs/construction/auth/manual-qa/auth-manual-qa-checklist.md` (16 bugs + bug-loop trail)
- `aidlc-docs/construction/auth/manual-qa/auth-manual-qa-results.md` (cycle-1 verdict)

## Question budget allocation
| Category | Count |
|----------|-------|
| First half — "Did the build match" (code vs FR) | 6 |
| Second half — "Did manual QA reveal a gap" | 6 |
| (subset) Per logged bug — sampled across 16 cycle-1 bugs | ≥ 3 |
| (subset) NFR demonstration | ≥ 2 |

## Pre-pass note
Manual QA reached all-PASS only after a substantial bug-loop cycle 1 that surfaced 16 stage-12 codegen + config bugs. Grill-Me #2 is therefore especially valuable here — it tests whether the pod understands not just the original FR/NFR but also the bug-history and the fix rationale, which is the highest-signal corpus for "did we actually understand what we built / fixed."
