# NFR Requirements Questions — auth UoW

Five short decisions. Stage 4's `requirements.md` already nails most NFRs with concrete targets; only the items below were left open and Stage 11 needs them to constrain framework choice.

---

## Question 1 — API latency target (NFR-PERF-001)
What's the p95 latency target for auth endpoints on the dev compose stack?

A) **p95 ≤ 200 ms** at ≤ 50 users (Codiste house default; matches requirements.md NFR-P01) **(Recommended)**
B) p95 ≤ 100 ms (stricter — may rule out heavier ORM choices like Django)
C) p95 ≤ 500 ms (more permissive — almost any stack qualifies)
X) Other

[Answer]:A

## Question 2 — Test coverage minimum (NFR-MAINT-001)
What's the floor for line coverage on the BE business-logic modules?

A) **≥ 80% lines** (Codiste house default; balances rigor with momentum) **(Recommended)**
B) ≥ 90% lines (stricter; may slow Stage 13 PROCEED)
C) ≥ 70% lines (more relaxed; not Codiste-house)
X) Other

[Answer]:A

## Question 3 — Cyclomatic complexity ceiling (NFR-MAINT-002)
Per-function complexity cap (lint-enforced)?

A) **≤ 10 per function** (Codiste house default; matches `eslint-plugin-sonarjs` / `mccabe` defaults) **(Recommended)**
B) ≤ 15 per function (more lenient)
C) ≤ 5 per function (very strict — likely fights with form-validation chains)
X) Other

[Answer]:A

## Question 4 — Backend language preference (constrains Stage 11)
Pre-narrow the backend language. Stage 11 still picks the framework.

A) **TypeScript / Node.js** (Codiste preset's first choice; richest FE ↔ BE shared-type story; NestJS / Express / Fastify all available) **(Recommended for a reference impl reusable on client engagements)**
B) Python (FastAPI / Django / Flask)
C) Go (stdlib + chi / Gin / Fiber)
D) Defer everything to Stage 11 (Stack Selection)
X) Other

[Answer]:A

## Question 5 — Approval to proceed to Part 2
A) **Approve; generate `auth-nfr-requirements.md` + `auth-tech-stack-decisions.md` + checklist now** **(Recommended)**
B) Pause — let me edit the plan myself
X) Other

[Answer]:A

---

## After answers

I'll:
1. Generate `auth-nfr-requirements.md` — 38 NFRs in the Stage-9 namespace (NFR-PERF-001 etc.), each with target + measurement
2. Generate `auth-tech-stack-decisions.md` — constraints implied by NFRs that narrow Stage 11's framework menu
3. Generate `auth-nfr-requirements-checklist.md`
4. Present Stage 9 completion message
5. **Immediately fire `/grill-me-1`** — 10–13 MCQs scoring ≥ 0.85 to PASS

> **Reminder**: per your initial framing, `/grill-me-1` is mandatory after Stage 9. It tests your read-back of FR (Stage 8) + NFR (Stage 9). On FAIL you pick Branch A (revise answers, capped at 3 rounds) or Branch B (update FR/NFR and loop back). The workflow cannot advance to Stage 10 (NFR Design) until PASS.
