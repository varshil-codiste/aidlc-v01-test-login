# Grill-Me #1 Plan — auth UoW

**UoW**: `auth`
**Tier**: Greenfield
**Generated at**: 2026-05-12T00:17:30Z
**Question count**: **12** (within Greenfield 10–15 range)
**Pass threshold**: 0.85 (= 11/12 PASS to reach PASS verdict; 10/12 = 0.83 = FAIL)

## Source artifacts
- `construction/auth/functional-design/business-rules.md` (12 BR-A rules)
- `construction/auth/functional-design/domain-entities.md` (2 entities)
- `construction/auth/functional-design/business-logic-model.md` (5 workflows)
- `construction/auth/nfr-requirements/auth-nfr-requirements.md` (46 NFRs)
- `construction/auth/nfr-requirements/auth-tech-stack-decisions.md`

## Question budget allocation
| Category | Count | Rationale |
|----------|-------|-----------|
| Critical BR (correctness) — auth-flow specifics | 8 | BR-A02 (email norm), A03 (hashing), A06 (rate-limit), A07 (enumeration), A08 (JWT), A09 (replay), A10 (cookies), A11 (setup gating) |
| NFR threshold probes | 2 | NFR-PERF-001 latency target, NFR-TEST-002 PBT invariants |
| Cross-stage consistency | 2 | Email-stub schema (Stage 8 Q2), DB choice (Stage 6 Q5) |
| **Total** | **12** | |

## Ground-truth handling
Ground-truth letter for each question is kept in chat memory ONLY during this invocation. Per-question verdicts (user answer vs ground truth) will be written to `auth-grill-me-1-results.md` after the user submits "done"; the verdicts are the audit trail.

## Distractor design
Each question has 4 lettered options A-D plus `X) Other`. Distractors are plausible misreadings of the relevant BR/NFR:
- A neighboring NFR's value
- A common-but-wrong default (e.g., HS256 instead of RS256; bcrypt instead of Argon2id)
- A "stricter or looser" version of the correct value
- A "natural assumption" answer that the BR explicitly contradicts

Correct-letter distribution is balanced (≈3 A's, 3 B's, 3 C's, 3 D's) to avoid letter-bias gaming.
