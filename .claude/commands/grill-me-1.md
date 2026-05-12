---
description: Post-NFR-Requirements quiz — fire after Stage 9, before Stage 10. Quizzes the user on FR/NFR with an 85% threshold; A/B FAIL loopback to revise answers or update FR/NFR.
---

# /grill-me-1 — Post-Requirements Quiz

Execute the **Grill-Me #1** sub-ritual per `.aidlc/aidlc-rule-details/construction/grill-me-1.md` for the current Unit of Work.

## Execution

Follow the three-part pattern exactly as specified in the rule file (`construction/grill-me-1.md` § Three-Part Pattern):

1. **Validate preconditions**:
   - Read `aidlc-docs/aidlc-state.md` — extract `Current UoW`, `Tier`, and `Current Stage`.
   - Confirm Stage 9 (NFR Requirements) is COMPLETE for this UoW. If not → print a blocking message naming the missing prerequisite + append an audit entry with `Outcome: blocked-by-policy`. Do NOT proceed.
   - Confirm no Stage 10+ artifacts have been signed for this UoW. If they have → print a blocking message and abort.
   - **Tier check** — if `Tier = bugfix` AND `{unit}-nfr-requirements.md` does not exist, print "Skipping /grill-me-1 — Bugfix Tier with no NFR Requirements artifact" and advance directly to Stage 10. Append audit entry `Outcome: skipped-by-tier`.

2. **Part 1 — Plan**: read FR + NFR source artifacts (paths listed in `construction/grill-me-1.md` § How Questions Are Derived). Compute question count using the tier heuristic: `min(max(3, ceil(num_BR / 2)), tier_ceiling)` where ceiling is 15/10/5 for Greenfield/Feature/Bugfix. Write `aidlc-docs/construction/{unit}/grill-me-1/{unit}-grill-me-1-plan.md`.

3. **Part 2 — Quiz**: derive questions per § How Questions Are Derived. Write the question file using the canonical format from `common/question-format-guide.md` (A/B/C/D/E + `X) Other` + `[Answer]:`). Write the checklist. Append the pre-invocation audit entry. Print "answer the file and tell me `done`" message and STOP.

4. **Wait for the user to reply `done`** (or equivalent). Do not proceed until they do.

5. **Part 3 — Score**: read the answered question file. Score each `[Answer]:` per § Scoring Rubric (binary; X) Other graded semantically). Compute aggregate. Write `{unit}-grill-me-1-results.md`. Append post-invocation audit entry with the score and verdict.

6. **Branch**:
   - **PASS** (aggregate ≥ 0.85) → print the PASS completion message (`construction/grill-me-1.md` § Completion Message). Update `aidlc-state.md`: `Grill-Me #1 → PASSED` for this UoW.
   - **FAIL** (aggregate < 0.85) → write `{unit}-grill-me-1-clarification-questions.md` with two sections: (i) one top-level question A/B asking the user to pick the loopback path, (ii) the failed questions copied verbatim with fresh `[Answer]:` tags. Print the FAIL completion message and STOP.

## Important constraints

- **NEVER** store the ground-truth key in a file on disk. It lives in chat memory only during this invocation. Per-question verdicts (which encode the key indirectly) are written to the results file — that is the audit trail.
- Every question must trace to a specific BR-ID or NFR-ID. Cite the source rule in the results file's `Source rule` column.
- For `X) Other` answers, log both the user's free-text rationale and the AI's semantic-grading reasoning to the results file so the pod can audit and override if needed.
- Branch A (revise answers) is capped at 3 clarification rounds. On the 4th attempt, force Branch B (update FR/NFR).
- Never advance to Stage 10 (NFR Design) until verdict is PASS or the Bugfix-skip condition is met.

## Artifact paths (per UoW)

All under `aidlc-docs/construction/{unit}/grill-me-1/`:
- `{unit}-grill-me-1-plan.md`
- `{unit}-grill-me-1-questions.md`
- `{unit}-grill-me-1-checklist.md`
- `{unit}-grill-me-1-results.md` (after Part 3)
- `{unit}-grill-me-1-clarification-questions.md` (if FAIL; up to 3 rounds with `-clarification-2-`, `-clarification-3-`)
- `{unit}-grill-me-1-gap-report.md` (if Branch B chosen)
