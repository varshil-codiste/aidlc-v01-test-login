# Grill-Me #1 Results — auth UoW

**Generated at**: 2026-05-12T00:18:00Z
**Tier**: Greenfield
**Total questions**: 12
**Pass threshold**: 0.85

## Per-Question Verdict

| Q# | User answer | Ground truth | Verdict | Source rule | Notes |
|----|-------------|--------------|---------|-------------|-------|
| 1  | D | D | ✅ PASS | BR-A02 (`business-rules.md`) | Email normalization location |
| 2  | C | C | ✅ PASS | BR-A03 (`business-rules.md`) | Password hash algorithm + params |
| 3  | A | A | ✅ PASS | BR-A06 (`business-rules.md`) | Rate-limit threshold |
| 4  | C | C | ✅ PASS | BR-A07 (`business-rules.md`) | Enumeration safety — shared error builder |
| 5  | D | D | ✅ PASS | BR-A08 + `services.md` env vars | JWT RS256 + JWKS endpoint |
| 6  | C | C | ✅ PASS | BR-A09 (`business-rules.md`) | Replay → family revoke |
| 7  | D | D | ✅ PASS | BR-A10 (`business-rules.md`) | Cookie flags + dev exception |
| 8  | B (entered as `b` — case-normalized) | B | ✅ PASS | BR-A11 + `frontend-components.md` | FE AuthGuard reads cached `/users/me` |
| 9  | C (entered as `c` — case-normalized) | C | ✅ PASS | NFR-TEST-002 (`auth-nfr-requirements.md`) | 4 PBT invariants |
| 10 | B (entered as `b` — case-normalized) | B | ✅ PASS | NFR-PERF-001 (`auth-nfr-requirements.md`) | p95 ≤ 200ms |
| 11 | D | D | ✅ PASS | Stage 8 Q2 (`auth-functional-design-checklist.md`) | 7-field email-stub schema |
| 12 | A | A | ✅ PASS | ADR-004 (`application-design.md`) | PostgreSQL 16 single instance |

## Aggregate

- **PASS**: 12  **FAIL**: 0
- **Score**: 12 / 12 = **1.00**
- **Verdict**: 🟢 **PASS** (1.00 ≥ 0.85 threshold)

## Letter normalization notes
- Questions 8, 9, 10 — user entered lowercase letters (`b`, `c`, `b`); per `grill-me-1.md` scoring rubric ("extract the first uppercase letter A–F or X"), the AI normalizes case before comparison. All three are valid PASS.
- No `X) Other` answers were used; no semantic grading required.

## If FAIL — failed items mapped to source artifacts
N/A — no failed items.

## If FAIL — loopback option chosen
N/A — direct PASS.

## Pod Override (optional)
N/A — pod has no grading dispute on a 12/12 PASS.

---

## Outcome

✅ Stage 10 (NFR Design) is now **unblocked**. The pod-validated reading of the FR (Stage 8) and NFR (Stage 9) for the `auth` UoW holds.
