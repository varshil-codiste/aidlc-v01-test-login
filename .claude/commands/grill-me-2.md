---
description: Pre-Gate-#4 quiz — fire after Manual QA all-PASS, before pod countersigns code-review-signoff. Quizzes the user on what was built (FR vs code + manual-QA results); 85% threshold; A/B/C FAIL loopback.
---

# /grill-me-2 — Pre-Sign-off Quiz

Execute the **Grill-Me #2** sub-ritual per `.aidlc/aidlc-rule-details/construction/grill-me-2.md` for the current Unit of Work.

## Execution

Follow the three-part pattern exactly as specified in the rule file (`construction/grill-me-2.md` § Three-Part Pattern):

1. **Validate preconditions**:
   - Read `aidlc-docs/aidlc-state.md` — extract `Current UoW`, `Tier`, `Current Stage`.
   - Confirm `aidlc-docs/construction/{unit}/manual-qa/{unit}-manual-qa-results.md` exists with Verdict = ✅ All-PASS. If not → print a blocking message naming the missing prerequisite + append an audit entry with `Outcome: blocked-by-policy`. Do NOT proceed.
   - Confirm `{unit}-code-review-signoff.md` exists with verdict block populated but pod countersignatures NOT yet collected. If countersigned → print a blocking message and abort.
   - **NOTE**: unlike `/grill-me-1`, this command is **always-on for every Tier**, including Bugfix. There is no Tier-skip path.

2. **Part 1 — Plan**: read all source artifacts (paths listed in `construction/grill-me-2.md` § How Questions Are Derived — note the additional sources beyond `/grill-me-1`: code summary, code-review report, manual-QA results). Compute question count using the tier heuristic. Write `aidlc-docs/construction/{unit}/grill-me-2/{unit}-grill-me-2-plan.md`.

3. **Part 2 — Quiz**: derive questions per § How Questions Are Derived. Allocate half the budget to "did the build match" (FR vs code), half to "did manual QA reveal a gap". Include at least one question per logged bug (if Manual QA had any) and at least one question on NFR demonstration. **Cite the source file by name in every question stem** — this forces the user to read the artifact during the quiz. Write the question file, checklist, and append the pre-invocation audit entry. Print "answer the file and tell me `done`" message and STOP.

4. **Wait for the user to reply `done`**.

5. **Part 3 — Score**: read the answered file. Score per § Scoring Rubric (same 85% binary rubric as `/grill-me-1`). Compute aggregate. Write `{unit}-grill-me-2-results.md`. Append post-invocation audit entry.

6. **Branch**:
   - **PASS** (aggregate ≥ 0.85) → print the PASS completion message. Update `aidlc-state.md`: `Grill-Me #2 → PASSED` for this UoW. Fill the `Grill-Me #2` row in `{unit}-code-review-signoff.md` verdict block. Pod may now countersign Gate #4.
   - **FAIL** (aggregate < 0.85) → write `{unit}-grill-me-2-clarification-questions.md` with three loopback options:
     - **A) Revise answers** — re-attempt failed questions only (cap = 3 rounds; 4th attempt forces Branch B)
     - **B) Re-run Manual QA** — reset Stage 14 scenarios to PENDING; re-execute
     - **C) Loop back further** — C1 Code Review (Stage 13), C2 Code Generation (Stage 12), or C3 Requirements (Stage 8/9)

## Important constraints

- **NEVER** store the ground-truth key in a file on disk. Same rule as `/grill-me-1`.
- Every question stem must cite a specific source artifact by file name (e.g., "Looking at `{unit}-code-summary.md` section X…"). Memory-only questions are forbidden.
- Per-bug coverage: if `{unit}-manual-qa-results.md` lists ≥ 1 bug (FIXED or REJECTED), at least one question must probe a bug's root cause or resolution.
- NFR coverage: at least one question must probe whether an NFR threshold was demonstrated by the test report.
- Gate #4 countersign is BLOCKED until verdict = PASS (Validation Rule 8 in `common/approval-gates.md`). If a pod tries to fill in signatures before this is satisfied, the AI must refuse and point at the missing/failed Grill-Me #2 results file.
- **Sev-1 exception does NOT apply**. Both Tech Lead AND Dev must pass Grill-Me #2 — Tech-Lead-solo countersign per `common/pod-ritual.md` is forbidden at Gate #4 for this reason.

## Artifact paths (per UoW)

All under `aidlc-docs/construction/{unit}/grill-me-2/`:
- `{unit}-grill-me-2-plan.md`
- `{unit}-grill-me-2-questions.md`
- `{unit}-grill-me-2-checklist.md`
- `{unit}-grill-me-2-results.md` (after Part 3)
- `{unit}-grill-me-2-clarification-questions.md` (if FAIL; up to 3 rounds with `-clarification-2-`, `-clarification-3-`)
