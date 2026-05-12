# Grill-Me #1 — Post-Requirements Quiz

**Type**: Sub-ritual attached to Stage 9 (NFR Requirements)
**Fires**: AFTER Stage 9 completes, BEFORE Stage 10 (NFR Design)
**Slash command**: `/grill-me-1`
**Purpose**: Force the user to demonstrate ≥85% understanding of the FR (Stage 8) and NFR (Stage 9) artifacts they just signed off, before the pipeline commits to NFR Design and Code Generation. If the user can't pass the quiz, the FR/NFR are either misunderstood or wrong — both are caught here, cheaply.

---

## Why This Sub-ritual Exists

Stages 8 and 9 produce dense artifacts (`business-rules.md`, `domain-entities.md`, `business-logic-model.md`, `{unit}-nfr-requirements.md`, `{unit}-tech-stack-decisions.md`). Sign-off on these is a sub-second click. If the user has not internalised what was written, the pipeline silently marches into Stack Selection and Code Generation on an unsteady foundation — and the drift only surfaces at Manual QA (Stage 14), by which point the cost of correction is much higher.

`/grill-me-1` inserts a forced read-back: the AI generates A/B/C/D/E multiple-choice questions whose ground-truth answers are pinned to specific BR-IDs and NFR-IDs. The user must answer; the AI scores; if aggregate is below 0.85, the user either revises their answers or loops back to Stage 8/9 to fix the underlying FR/NFR.

---

## Prerequisites

- Stage 9 (`{unit}-nfr-requirements.md`) is complete; checklist all `[x]` or `[~]`.
- `aidlc-docs/aidlc-state.md` shows the current UoW and Tier.
- The pod has NOT yet signed any Stage 10+ artifacts for this UoW.

---

## Tier-Aware Question Count

| Tier | Default behavior | Question count |
|------|------------------|----------------|
| Greenfield | **Mandatory** | 10–15 (scale with BR count) |
| Feature | **Mandatory** | 7–10 |
| Bugfix | **Optional, default skip** (Stage 9 itself is usually skipped for Bugfix). If Stage 9 ran due to NFR regression, fire at 3–5 questions. |

The exact count is computed at invocation time. Heuristic: `min(max(3, ceil(num_BR / 2)), tier_ceiling)` where `tier_ceiling` is 15 (Greenfield), 10 (Feature), 5 (Bugfix).

---

## How Questions Are Derived

Source artifacts:
- `aidlc-docs/construction/{unit}/functional-design/business-rules.md` (BR-001…)
- `aidlc-docs/construction/{unit}/functional-design/domain-entities.md`
- `aidlc-docs/construction/{unit}/functional-design/business-logic-model.md`
- `aidlc-docs/construction/{unit}/nfr-requirements/{unit}-nfr-requirements.md`

Question-generation rules:

1. **One question per top-priority BR**, up to the count budget. Priority order: BRs flagged "critical" in the source > BRs with downstream dependencies > BRs touching money / auth / data integrity > remaining BRs.
2. **Plus NFR threshold probes** — at least 2 questions of the budget probe specific NFR numbers (e.g., "What is the p95 latency target for `/auth/signup`?", "What is the encryption-at-rest cipher for stored credentials?").
3. **Multiple choice**: one correct answer + 3 plausible distractors derived from common misreadings of the same BR/NFR. The "Other" option is always `X) Other` per `common/question-format-guide.md`.
4. **Distractor design**: distractors must be specific (not "Some other value") and plausibly wrong. Examples of good distractors: a value from a *neighbouring* BR; a value from a *related* NFR category; a value that was once proposed in the audit log but changed during sign-off.
5. **Ground truth** for each question is stored only in chat memory during the invocation. Per-question verdicts are written to the results file so the pod has an audit trail.

---

## Three-Part Pattern

**Plan → Quiz → Score**.

### Part 1 — Plan
- Read `aidlc-state.md`; resolve `{unit}` and Tier.
- Compute question count.
- Generate `aidlc-docs/construction/{unit}/grill-me-1/{unit}-grill-me-1-plan.md`:

```markdown
# Grill-Me #1 Plan — {unit}

**UoW**: <name>     **Tier**: <…>     **Generated at**: <ISO>
**Question count**: <n>     **Pass threshold**: 0.85

## Source artifacts
- functional-design/business-rules.md (<n> BRs)
- functional-design/business-logic-model.md
- nfr-requirements/{unit}-nfr-requirements.md (<n> NFRs)

## Question budget allocation
| Category | Count |
|----------|-------|
| Critical BR (correctness) | <n> |
| NFR threshold | <n> |
| Cross-BR consistency | <n> |
```

### Part 2 — Quiz
- Write `aidlc-docs/construction/{unit}/grill-me-1/{unit}-grill-me-1-questions.md` per `common/question-format-guide.md` format. One example question:

```markdown
## Question 1
According to BR-005 in `business-rules.md`, when does a refresh token rotate?

A) Every time it is used to obtain a new access token
B) Every time it is issued
C) Only when the access token expires
D) Only when the user explicitly logs out
X) Other (please describe after [Answer]: tag below)

[Answer]:
```

- Write `{unit}-grill-me-1-checklist.md` per `common/checklist-conventions.md`:

```markdown
- [ ] All <n> questions answered (no blank [Answer]: tags)
- [ ] Score computed and recorded in {unit}-grill-me-1-results.md
- [ ] Threshold decision recorded (PASS ≥ 0.85 or FAIL < 0.85)
- [ ] If FAIL: loopback option selected by user in clarification file
```

- Append pre-invocation audit entry per `aidlc-rules/core-workflow.md` § Audit:

```markdown
## Grill-Me #1 — {unit} — Invocation
**Timestamp**: <ISO>
**User Input**: "/grill-me-1"
**AI Response**: "Generated {n} questions in {unit}-grill-me-1-questions.md (Tier: {…}). Awaiting user answers."
**Context**: Sub-ritual attached to Stage 9 complete → Stage 10 pending.

---
```

- Print "answer the file and tell me `done`" message per `common/question-format-guide.md`.

- **WAIT** for user `done`.

### Part 3 — Score
- Read `{unit}-grill-me-1-questions.md`; extract each `[Answer]:`.
- Score per the rubric below.
- Write `{unit}-grill-me-1-results.md` (template below).
- Append post-invocation audit entry with the aggregate score and verdict.
- Branch:
  - **PASS** (aggregate ≥ 0.85): print completion message routing to Stage 10.
  - **FAIL** (aggregate < 0.85): generate `{unit}-grill-me-1-clarification-questions.md` with two sections — (i) the failed questions to be re-attempted, (ii) one top-level question asking the user to pick loopback option A or B (see § FAIL Loopback below).

---

## Scoring Rubric — 85% Threshold

**Per-question** (binary, no partial credit):
- Each question has exactly one ground-truth letter (A–E).
- The user's `[Answer]:` is parsed: extract the first uppercase letter A–F or X.
- If the user picked **X (Other)**, the AI grades the free-text rationale semantically against the ground-truth answer:
  - Semantic match → PASS
  - Semantic mismatch → FAIL
  - The rationale and the AI's reasoning are both written to the results file so the pod can audit.
- For all other letters: exact letter match → PASS, mismatch → FAIL.
- Unanswered (`[Answer]:` left blank) or invalid input → FAIL.

**Aggregate** = PASS count / total questions.
- aggregate ≥ 0.85 → **PASS**
- aggregate < 0.85 → **FAIL**

**Results-file template** (`{unit}-grill-me-1-results.md`):

```markdown
# Grill-Me #1 Results — {unit}

**Generated at**: <ISO>     **Tier**: <…>
**Total questions**: <n>    **Pass threshold**: 0.85

## Per-Question Verdict
| Q# | User answer | Ground truth | Verdict | Source rule |
|----|-------------|--------------|---------|-------------|
| 1  | B           | B            | PASS    | BR-001 |
| 2  | A           | C            | FAIL    | BR-005 |
| 3  | X (Other: "rotates only on issue") | B | FAIL — semantic mismatch | BR-005 |
| …  | …           | …            | …       | … |

## Aggregate
- PASS: <n>     FAIL: <n>     Score: <n>/<total> = <0.XX>
- **Verdict**: <PASS | FAIL>

## If FAIL — failed items mapped to source artifacts
| Q# | Failed rule | Source artifact | Section |
|----|-------------|------------------|---------|
| 2  | BR-005      | functional-design/business-rules.md | § "Rule BR-005" |
| 3  | BR-005      | functional-design/business-rules.md | § "Rule BR-005" |

## If FAIL — loopback option chosen
<filled after user answers clarification question>

## Pod Override (optional)
<rare — pod may dispute the AI's semantic grading of an X) Other answer here>
```

---

## FAIL Loopback

When verdict is FAIL, generate `{unit}-grill-me-1-clarification-questions.md`:

```markdown
## Question 1 — Loopback Option
Your aggregate score was <X>/<n> = <0.XX> (below the 0.85 threshold). Which path do you want to take?

A) Revise my answers — I want another attempt at the failed questions only (the PASS answers stay)
B) Update FR/NFR — my understanding is correct but the FR/NFR document is wrong/incomplete; loop back to Stage 8/9 to fix the document, then re-run /grill-me-1
X) Other (please describe after [Answer]: tag below)

[Answer]:

## Question 2 onwards — Failed questions to re-answer (only if you pick A above)
<failed questions copied here verbatim from {unit}-grill-me-1-questions.md, with fresh [Answer]: tags>
```

**Branch A — Revise answers**:
1. User re-answers only the failed questions in this clarification file.
2. AI re-scores: aggregate = (original PASS count + new PASS count from re-attempts) / total.
3. If aggregate ≥ 0.85 → PASS; advance to Stage 10.
4. If still < 0.85 → second clarification file (`{unit}-grill-me-1-clarification-2-questions.md`). **Cap = 3 clarification rounds**. On the 4th attempt the AI forces Branch B.

**Branch B — Update FR/NFR**:
1. AI writes `{unit}-grill-me-1-gap-report.md` listing the failed BR/NFR IDs and what specifically the user's wrong answers imply is missing or unclear in the source documents.
2. AI loops back to Stage 8 (Functional Design) and/or Stage 9 (NFR Requirements), opens the relevant `.md` files with the gap report side-by-side, and asks the user to revise.
3. After the user signs the revised Stage 8 / 9 artifacts, `/grill-me-1` is re-invoked from scratch (fresh question set derived from the revised documents).

**Audit logging**: each branch decision and each clarification round is appended to `aidlc-docs/audit.md` per the standard format.

---

## Stage Checklist (`{unit}-grill-me-1-checklist.md`)

```markdown
- [ ] Plan file generated ({unit}-grill-me-1-plan.md)
- [ ] Question file generated ({unit}-grill-me-1-questions.md) — format conforms to common/question-format-guide.md
- [ ] All <n> questions answered
- [ ] Results file generated with per-question verdicts ({unit}-grill-me-1-results.md)
- [ ] Aggregate score ≥ 0.85 (PASS) OR loopback completed (clarification file or FR/NFR revision)
- [ ] Pre-invocation + post-invocation audit entries appended
- [ ] aidlc-state.md updated: Grill-Me #1 → PASSED for {unit}
```

---

## Completion Message

### When verdict is PASS

```markdown
# Grill-Me #1 — {unit} — PASS ✅

**Score**: <n>/<total> = <0.XX>  **Threshold**: 0.85
**Tier**: <…>

> **🚀 WHAT'S NEXT?**
>
> ✅ Continue to Stage 10 (NFR Design)
```

### When verdict is FAIL

```markdown
# Grill-Me #1 — {unit} — FAIL ⛔

**Score**: <n>/<total> = <0.XX>  **Threshold**: 0.85
**Failed rules**: <BR-005, NFR-PERF-001, …>

Two paths in `{unit}-grill-me-1-clarification-questions.md`:
- **A) Revise my answers** — re-attempt failed questions only
- **B) Update FR/NFR** — loop back to Stage 8/9 to fix the documents

Pick one. Cap on Branch A: 3 clarification rounds.
```

---

## Bugfix Tier Considerations

For Bugfix tier, `/grill-me-1` is **optional and defaults to skip** (because Stage 9 NFR Requirements itself usually skips for Bugfix). If Stage 9 ran for this UoW (e.g., NFR regression detected), `/grill-me-1` fires at the reduced count of 3–5 questions, focused on the regression-relevant NFR thresholds.

The Tier-aware skip is implemented by reading `aidlc-state.md` § `## Tier` at the top of Part 1 — if Tier = bugfix AND `{unit}-nfr-requirements.md` does not exist, the AI prints "Skipping /grill-me-1 — Bugfix Tier with no NFR Requirements artifact" and advances directly to Stage 10 (which is also likely a no-op for bugfix).

---

## Anti-patterns

- ❌ Generating questions whose ground-truth answer is not pinned to a specific BR-ID or NFR-ID — every question must trace to source
- ❌ Distractors that are all "obviously wrong" — distractors must be plausible misreadings of the same source rule
- ❌ Showing the ground-truth key to the user before scoring — the key lives in chat memory only during invocation
- ❌ Marking a `X) Other` answer PASS without recording the AI's semantic-grading reasoning in the results file
- ❌ Exceeding the 3-clarification-round cap on Branch A — at that point the FR/NFR is the problem, not the user's understanding
- ❌ Allowing the pod to sign Stage 10 (NFR Design) artifacts before `/grill-me-1` reaches PASS or is legitimately skipped (Bugfix tier)
