# Grill-Me #2 — Pre-Sign-off Quiz

**Type**: Sub-ritual attached to Stage 14 (Manual QA) — fires after Manual QA all-PASS, before Gate #4 pod countersign
**Fires**: AFTER Stage 14 (Manual QA) reaches all-PASS, BEFORE pod countersigns `{unit}-code-review-signoff.md`
**Slash command**: `/grill-me-2`
**Purpose**: Force the user to demonstrate ≥85% understanding of what was actually *built*, not just what was *specified*. Where `/grill-me-1` quizzes on the FR/NFR artifacts, `/grill-me-2` quizzes on the completed UoW — did the build match the FR? are NFRs met? did Manual QA reveal anything that should be a new acceptance criterion?

---

## Why This Sub-ritual Exists

By the time a UoW reaches the end of Stage 14, four things are true:
- The AI emitted a PROCEED verdict in Stage 13 (lint clean, security clean, tests green, AI review approves).
- The pod manually exercised the unit and marked all scenarios PASS, with all bugs FIXED or REJECTED.
- The pod is about to countersign Gate #4 and move on.
- The pod has been heads-down in the unit for a long stretch and is likely fatigued.

`/grill-me-2` interrupts the fatigue-driven countersign and forces a final read-back: did the build actually match the FR you signed at Stage 8? Are the NFR thresholds from Stage 9 actually demonstrated by the test report from Stage 13? Did Manual QA surface anything that should be a new acceptance criterion for the next UoW? If any answer is "no" or "I don't know", the pod sees that **before** the gate is signed, not after the unit has shipped.

The 85% threshold and the loopback A/B/C mechanic mirror `/grill-me-1`. The differences are: (a) questions are derived from a richer source set (code summary + code-review report + manual-QA results, in addition to FR/NFR), and (b) Grill-Me #2 is **always-on for every Tier**, including Bugfix.

---

## Prerequisites

- Stage 14 (Manual QA) reached all-PASS — `{unit}-manual-qa-results.md` exists with Verdict = ✅ All-PASS.
- Stage 13 (Code Review) verdict is PROCEED or PROCEED-with-caveats.
- `{unit}-code-review-signoff.md` exists with the verdict block populated but pod countersignatures NOT yet collected.
- `aidlc-docs/aidlc-state.md` shows current UoW.

---

## Tier-Aware Question Count

| Tier | Question count |
|------|----------------|
| Greenfield | 10–15 |
| Feature | 7–10 |
| Bugfix | 3–5 — **always fires**, even when Stage 9 was skipped |

Bugfix-tier Grill-Me #2 focuses on: "Did the fix actually fix the bug?" + "Does the new regression test exercise the right path?" + "Did Manual QA expose any adjacent flow that the fix broke?".

The exact count is computed at invocation time, same heuristic as `/grill-me-1`: `min(max(3, ceil(num_BR / 2)), tier_ceiling)`.

---

## How Questions Are Derived

Source artifacts:
- `aidlc-docs/construction/{unit}/functional-design/business-rules.md` (BR-001…)
- `aidlc-docs/construction/{unit}/nfr-requirements/{unit}-nfr-requirements.md` (NFRs)
- **NEW (vs /grill-me-1)**: `aidlc-docs/construction/{unit}/code/{unit}-code-summary.md` (what was actually built — files, functions, key decisions)
- **NEW**: `aidlc-docs/construction/{unit}/code-review/{unit}-code-review-report.md` (lint/security/tests/AI-review synthesis)
- **NEW**: `aidlc-docs/construction/{unit}/manual-qa/{unit}-manual-qa-results.md` (scenarios + bugs)

Question budget allocation (half / half):

| Half | Focus | Example |
|------|-------|---------|
| First half — "Did the build match" | Compare code-summary against business-rules.md | "BR-005 says refresh tokens rotate on use. Looking at `{unit}-code-summary.md`, in which file is the rotation logic implemented?" |
| Second half — "Did manual QA reveal a gap" | Probe whether Manual QA scenarios exposed a missing acceptance criterion | "Manual QA Scenario 4 (`{unit}-manual-qa-checklist.md`) tested invalid email format. The BR for this UoW does NOT mention email-format validation explicitly. Should this become a new acceptance criterion in BR-001 for the next UoW?" |

Question-generation rules (in addition to `/grill-me-1`'s):

1. **Cite the source file by name** in every question stem (e.g., "Looking at `{unit}-code-summary.md` section X…"). This forces the user to actually read the artifact during the quiz, not rely on memory of the spec.
2. **At least one question per logged bug** (if Manual QA had bugs that were FIXED): "BUG-{unit}-002 logged a duplicate-email rejection failure. What was the root cause per the resolution field?"
3. **At least one question on NFR demonstration**: "NFR-PERF-001 targets p95 ≤ 250ms. According to `{unit}-test-report.md` Section "Coverage Below NFR Target", was this NFR met?"
4. **Distractors**: same plausibility rules as `/grill-me-1`. Distractors may reference *neighbouring* commits, *prior* iterations of the same file, or *similarly-named* artifacts to test whether the user is reading the current state of the artifacts or recalling stale memory.
5. **Ground truth** is stored in chat memory only during invocation. Per-question verdicts are written to the results file.

---

## Three-Part Pattern (same shape as /grill-me-1)

**Plan → Quiz → Score**.

### Part 1 — Plan
- Read `aidlc-state.md`; resolve `{unit}` and Tier.
- Compute question count.
- Generate `aidlc-docs/construction/{unit}/grill-me-2/{unit}-grill-me-2-plan.md`:

```markdown
# Grill-Me #2 Plan — {unit}

**UoW**: <name>     **Tier**: <…>     **Generated at**: <ISO>
**Question count**: <n>     **Pass threshold**: 0.85
**Manual QA iteration**: <n> of max 3 (cycle that reached all-PASS)

## Source artifacts
- functional-design/business-rules.md
- nfr-requirements/{unit}-nfr-requirements.md
- code/{unit}-code-summary.md
- code-review/{unit}-code-review-report.md
- manual-qa/{unit}-manual-qa-results.md

## Question budget allocation
| Category | Count |
|----------|-------|
| "Did the build match" (code vs FR) | <half> |
| "Did manual QA reveal a gap" | <half> |
| (subset) Per logged bug | <≥1 if bugs were logged> |
| (subset) NFR demonstration | <≥1> |
```

### Part 2 — Quiz
- Write `{unit}-grill-me-2-questions.md` per `common/question-format-guide.md` format.
- Write `{unit}-grill-me-2-checklist.md` per `common/checklist-conventions.md`.
- Append pre-invocation audit entry.
- Print "answer the file and tell me `done`" message.
- **WAIT** for user `done`.

### Part 3 — Score
- Same rubric as `/grill-me-1` (85% threshold, per-question binary, X) Other semantically graded).
- Write `{unit}-grill-me-2-results.md` (template below).
- Append post-invocation audit entry.
- Branch:
  - **PASS**: print completion message routing to Gate #4 pod countersign.
  - **FAIL**: generate `{unit}-grill-me-2-clarification-questions.md` with three loopback options (see § FAIL Loopback below).

---

## Scoring Rubric — 85% Threshold

Identical to `/grill-me-1` § Scoring Rubric. Per-question binary (letter match → PASS, mismatch → FAIL); aggregate ≥ 0.85 → PASS.

**Results-file template** (`{unit}-grill-me-2-results.md`):

```markdown
# Grill-Me #2 Results — {unit}

**Generated at**: <ISO>     **Tier**: <…>
**Total questions**: <n>    **Pass threshold**: 0.85

## Per-Question Verdict
| Q# | User answer | Ground truth | Verdict | Source rule / artifact |
|----|-------------|--------------|---------|------------------------|
| 1  | B           | B            | PASS    | BR-001 + code-summary.md § "auth/signup.service.ts" |
| 2  | A           | C            | FAIL    | BUG-{unit}-002 resolution field |
| …  | …           | …            | …       | … |

## Aggregate
- PASS: <n>     FAIL: <n>     Score: <n>/<total> = <0.XX>
- **Verdict**: <PASS | FAIL>

## If FAIL — failed items mapped to source artifacts
| Q# | Failed rule / artifact | Section |
|----|-------------------------|---------|
| 2  | BUG-{unit}-002 | manual-qa-checklist.md § "Bugs Logged" |
| 5  | NFR-PERF-001   | nfr-requirements.md § "Performance" + test-report.md § "Coverage Below NFR Target" |

## If FAIL — loopback option chosen
<filled after user answers clarification question>

## Pod Override (optional)
<rare — pod may dispute the AI's semantic grading of an X) Other answer here>
```

---

## FAIL Loopback (A / B / C)

When verdict is FAIL, generate `{unit}-grill-me-2-clarification-questions.md`:

```markdown
## Question 1 — Loopback Option
Your aggregate score was <X>/<n> = <0.XX> (below the 0.85 threshold). Which path do you want to take?

A) Revise my answers — re-attempt the failed questions only (the PASS answers stay)
B) Re-run Manual QA — the scenarios I PASSed in Stage 14 are suspect; reset all scenarios to [ ] PENDING and re-execute
C) Loop back further — pick the stage to revisit:
   C1) Code Review (Stage 13) — the AI verdict was wrong; re-run with new emphasis
   C2) Code Generation (Stage 12) — the build itself is wrong; revise code
   C3) Requirements (Stage 8/9) — the FR/NFR was wrong; revise documents and re-run /grill-me-1 → Stage 10+
X) Other (please describe after [Answer]: tag below)

[Answer]:

## Question 2 onwards — Failed questions to re-answer (only if you pick A above)
<failed questions copied here verbatim, with fresh [Answer]: tags>
```

**Branch A — Revise answers**:
- Same as `/grill-me-1` Branch A. Cap = 3 clarification rounds. On the 4th attempt, the AI forces Branch B.

**Branch B — Re-run Manual QA**:
- AI resets `{unit}-manual-qa-checklist.md` — all scenario states → `[ ] PENDING`; existing bugs (FIXED / REJECTED) preserved as history.
- Pod re-executes Stage 14 from Step 2. Any new bugs trigger the bug-loop as usual.
- After all-PASS again → `/grill-me-2` re-invoked from scratch (fresh question set).

**Branch C — Loop back further**:
- C1 (Code Review): AI archives the current Code Review reports under `*.bak.md`, returns to Stage 13 Step 1, re-runs the four checks with emphasis flagged in the loopback. After PROCEED verdict → Stage 14 → `/grill-me-2`.
- C2 (Code Generation): AI returns to Stage 12b, addresses the specific findings the failed questions point to. Then Stage 13 → Stage 14 → `/grill-me-2`.
- C3 (Requirements): AI opens `business-rules.md` / `{unit}-nfr-requirements.md` with a gap report, user revises, sign-off, then `/grill-me-1` re-runs from scratch, and the rest of the cycle (Stages 10–14 → `/grill-me-2`) follows.

**Audit logging**: each branch decision is appended to `aidlc-docs/audit.md` per the standard format.

---

## Stage Checklist (`{unit}-grill-me-2-checklist.md`)

```markdown
- [ ] Plan file generated ({unit}-grill-me-2-plan.md)
- [ ] Question file generated ({unit}-grill-me-2-questions.md) — format conforms to common/question-format-guide.md
- [ ] Questions cite source artifacts by file name (not memory)
- [ ] At least one question per logged bug (if Manual QA had bugs)
- [ ] At least one question on NFR demonstration
- [ ] All <n> questions answered
- [ ] Results file generated with per-question verdicts ({unit}-grill-me-2-results.md)
- [ ] Aggregate score ≥ 0.85 (PASS) OR loopback completed (clarification file, re-run Manual QA, or further loopback)
- [ ] Pre-invocation + post-invocation audit entries appended
- [ ] aidlc-state.md updated: Grill-Me #2 → PASSED for {unit}
- [ ] {unit}-code-review-signoff.md verdict block "Grill-Me #2" row filled
```

---

## Completion Message

### When verdict is PASS

```markdown
# Grill-Me #2 — {unit} — PASS ✅

**Score**: <n>/<total> = <0.XX>     **Threshold**: 0.85
**Tier**: <…>     **Manual QA iteration**: <n> of max 3

> **🚀 WHAT'S NEXT?**
>
> ✅ Continue — Gate #4 verdict block now complete (all four AI checks + Manual QA all-PASS + Grill-Me #2 PASS).
> 👥 Pod can countersign `{unit}-code-review-signoff.md`.
```

### When verdict is FAIL

```markdown
# Grill-Me #2 — {unit} — FAIL ⛔

**Score**: <n>/<total> = <0.XX>     **Threshold**: 0.85
**Failed items**: <BR-005, BUG-{unit}-002, NFR-PERF-001, …>

Three paths in `{unit}-grill-me-2-clarification-questions.md`:
- **A) Revise my answers** — re-attempt failed questions only (cap = 3 rounds)
- **B) Re-run Manual QA** — re-execute Stage 14 from PENDING
- **C) Loop back further** — Code Review (Stage 13) / Code Generation (Stage 12) / Requirements (Stage 8/9)

Pick one. Gate #4 cannot be countersigned until /grill-me-2 reaches PASS.
```

---

## ⛔ GATE #4 Validation

`common/approval-gates.md` § "AI-DLC Verdict Validation (Gate #4 only)" Rule 8 states:

> Rule 8: The Grill-Me #2 results file (`{unit}-grill-me-2-results.md`) exists, has Verdict = PASS, and Generated-at is within the last 7 days.

If the pod attempts to fill in the countersignatures of `{unit}-code-review-signoff.md` while Rule 8 is unsatisfied, the AI refuses to advance the workflow and points the pod at the missing or failed Grill-Me #2 file. This refusal is logged to `aidlc-docs/audit.md` with `Outcome: blocked-by-policy`.

---

## Bugfix Tier Considerations

For Bugfix tier, `/grill-me-2` is **mandatory and always fires**, at the reduced count of 3–5 questions. The questions focus on:

- **Did the fix actually fix the bug?** (cites `{unit}-code-summary.md` + the regression test in `{unit}-test-report.md`)
- **Does the new regression test exercise the right path?** (cites `business-rules.md` § the BR that motivated the fix)
- **Did Manual QA expose any adjacent flow that the fix broke?** (cites `{unit}-manual-qa-results.md` § scenarios)

The Bugfix `/grill-me-2` is the strict-mode safety net — Sev-1 exception (Tech Lead solo countersign) does NOT relax it. Both Tech Lead and Dev must pass it (the test is on the pod's collective understanding, not just one signer).

---

## Anti-patterns

- ❌ Generating questions that re-use `/grill-me-1`'s phrasing — Grill-Me #2 is about what was **built**, not what was **specified**
- ❌ Forgetting to cite the source artifact by file name in question stems — without the citation, the user can answer from stale memory
- ❌ Skipping the "per logged bug" question when Manual QA had bugs — the bug history is the highest-signal source for "did we understand the issue"
- ❌ Pod countersigning Gate #4 while `/grill-me-2` is FAIL or absent — Validation Rule 8 forbids this
- ❌ Relaxing Grill-Me #2 under Sev-1 (Tech Lead solo) — Grill-Me #2 is strict-mode always
- ❌ Treating Grill-Me #2 as redundant with the Stage 13 AI verdict — the AI verdict tests the code; Grill-Me #2 tests the pod's understanding of the code, which is what authorises the gate
