# Manual QA Testing

**Stage**: 14 (always-execute, per-UoW) — **NEW team-specific stage**
**Gate**: Feeds into Gate #4 — Manual QA all-PASS is a prerequisite for pod countersign on `{unit}-code-review-signoff.md`
**Purpose**: Have the human pod actually exercise the built UoW against its FR acceptance criteria. The AI's Stage 13 verdict catches everything mechanical (lint, security, tests, AI review); Manual QA catches the product-level UX bugs that only a human eyes-on session can reveal.

---

## Why This Stage Exists

Gate #4's AI-DLC verdict in Stage 13 (Code Review) is mechanically thorough — lint clean, no Critical/High SAST, all tests green, AI review approves. A unit can satisfy all of that and still ship a flow that doesn't match what the user actually wants. Examples the AI cannot catch:

- The signup form labels say "Email" but the field validates as username
- A confirmation toast fires but immediately disappears before the user can read it
- The mobile screen renders correctly in the emulator but the keyboard overlaps the submit button on real devices
- The flow technically implements BR-005 but the wording is so confusing that real users abandon it

Manual QA is the human safety net for these. It is **user attestation only** — no required artifacts (no screenshots, no logs) — but it is **mandatory** and **bug-loop enforced**: any bug logged here returns the UoW to Stage 12b (Code Generation Part 2), through Stage 13 again, back to Stage 14, until zero bugs remain.

---

## Prerequisites

- Stage 13 (Code Review) emitted verdict **PROCEED** or **PROCEED-with-caveats** for this UoW.
- `{unit}-code-review-signoff.md` exists with the verdict block filled in (but NOT pod-countersigned yet — countersign waits until Stage 14 + `/grill-me-2` both pass).
- The unit's code is **runnable locally** by the pod (Stage 12 setup confirmed `npm run dev` / `flutter run` / equivalent works).
- `aidlc-docs/aidlc-state.md` shows current UoW.

---

## Tier-Aware Scope

| Tier | Scope | Typical scenario count |
|------|-------|------------------------|
| Greenfield | **Full FR acceptance-criteria coverage** for this UoW | One scenario per BR with acceptance criteria; one happy-path per user story |
| Feature | **Affected-flow coverage** | Scenarios for new/changed BRs only + smoke test of one upstream and one downstream flow |
| Bugfix | **Regression scenario + adjacent affected flows** | One scenario reproducing the bug from BR (must now PASS) + 2–3 adjacent scenarios from the same `*-test.md` neighbourhood |

Manual QA is **NEVER skippable**, including Bugfix Tier. The Bugfix scope is narrow but the stage still fires — it is the safety net specifically because Bugfix skips so much rigor (no NFR Requirements, no user stories).

---

## Step-by-Step Execution

### Step 1 — Generate the manual-QA checklist

AI reads `aidlc-docs/construction/{unit}/functional-design/business-rules.md` and (if it exists) `aidlc-docs/construction/{unit}/functional-design/user-stories.md`, and produces:

`aidlc-docs/construction/{unit}/manual-qa/{unit}-manual-qa-checklist.md` per `common/checklist-conventions.md`:

```markdown
# Manual QA Checklist — {unit}

**UoW**: <name>     **Tier**: <…>     **Generated at**: <ISO>
**How to use**: Open the unit's local dev environment. Walk each Scenario below by hand. Mark each scenario PASS / FAIL / N/A. If FAIL, log a Bug below. Stage cannot advance with any open Bug or unresolved FAIL.

## Scenarios

### Scenario 1 — Happy path signup (BR-001)
- **Pre-condition**: <e.g., user not registered>
- **Steps**:
  1. <…>
  2. <…>
  3. <…>
- **Expected**: <observable outcome tied to BR-001 acceptance criterion>
- **State**: [ ] PENDING
- **Tested by**: <name>     **Tested at**: <ISO>
- **Notes**: <one line>

### Scenario 2 — Duplicate email rejection (BR-002)
…
```

Scenario item states (per `common/checklist-conventions.md`):
- `[ ] PENDING` — not yet tested
- `[x] PASS` — exercised, observed expected behaviour
- `❌ FAIL` — exercised, observed wrong behaviour (must link to a Bug entry below)
- `[~] N/A: <reason>` — skipped for a specific stated reason (e.g., "scenario depends on payment provider sandbox, currently unavailable"); the pod can revoke at sign-off

### Step 2 — Pod executes scenarios

This is the human step. The Tech Lead or Dev (or both) runs each scenario by hand. They mark state and tested-by inline. No required artifacts — user attestation is sufficient.

### Step 3 — Bug-loop (if any scenario FAILs)

When a scenario is marked ❌ FAIL, the pod adds a Bug entry to the same file:

```markdown
## Bugs Logged

### BUG-{unit}-001
- **Title**: Signup form labels "Email" but validates as username
- **Severity**: Critical | High | Medium | Low
- **Reproduction steps**:
  1. Open /auth/signup
  2. Enter `user@example.com` in the Email field
  3. Submit
- **Expected**: form accepts the email and routes to /auth/verify
- **Observed**: form rejects with "username must be 3–20 chars"
- **Source rule**: BR-001 (optional — if traceable)
- **Logged by**: <name>     **Logged at**: <ISO>
- **Status**: OPEN | IN-PROGRESS | FIXED | REJECTED
- **Resolution**: <filled when status flips to FIXED; references commit SHA + Code Gen iteration #>
```

Bug status lifecycle:
- **OPEN** — newly logged, awaiting fix
- **IN-PROGRESS** — AI is in Stage 12b addressing it
- **FIXED** — AI has fixed in code; pod re-tested the scenario, scenario now PASS; resolution field references the commit SHA
- **REJECTED** — pod and AI agreed the bug is not actually a bug (e.g., a misread of the BR); rejection requires a reason in the Resolution field

**Trigger logic**: if at the end of Step 2 there is at least one bug with status OPEN, the stage is in the bug-loop:

1. AI appends to `aidlc-docs/audit.md`:

   ```markdown
   ## Manual QA Bug-Loop Trigger — {unit}
   **Timestamp**: <ISO>
   **User Input**: "<verbatim user message that triggered the loop>"
   **AI Response**: "Detected <n> OPEN bugs in {unit}-manual-qa-checklist.md (<list with severities>). Re-entering Stage 12b (Code Generation Part 2) to address findings. After Code Gen → re-run Stage 13 Code Review → re-run Stage 14 Manual QA. Iteration count: <n>."
   **Context**: Manual QA bug-loop, cycle <n> of max 3.

   ---
   ```

2. AI flips each OPEN bug to IN-PROGRESS.

3. AI returns to **Stage 12b (Code Generation Part 2)** and addresses each IN-PROGRESS bug — running tests at each step per team convention. The fix may also require adjustments to `business-rules.md` (if the BR was wrong, not the code); if so, the AI updates the BR, re-runs `/grill-me-1` for the affected UoW, and only then proceeds with the code fix.

4. After all IN-PROGRESS bugs have fixes in code, AI re-runs **Stage 13 (Code Review)** from Step 1 — fresh lint + security + tests + AI review reports. New verdict block emitted. Prior reports archived under `<unit>-code-review-report.<ts>.bak.md`.

5. On Stage 13 PROCEED, AI re-enters **Stage 14 (Manual QA)** — generates a fresh checklist (or, if the existing scenarios are still valid, re-uses them with all states reset to `[ ] PENDING`). The pod re-executes. Bugs that should now be FIXED are auto-marked IN-PROGRESS by the AI on re-entry; on the pod's re-test PASS, they flip to FIXED with the commit SHA from the most recent Code Gen iteration.

6. Loop until zero open or in-progress bugs AND zero FAIL scenarios, OR until cycle 3 is exhausted.

**Loop cap = 3 cycles**. On cycle 4 the AI pauses and asks the pod to escalate to Functional Design re-work — at that point the FR itself is suspect, not the code.

### Step 4 — Stage completion

When every scenario is `[x] PASS` or `[~] N/A: <reason>` AND every Bug is FIXED or REJECTED:

- AI generates `aidlc-docs/construction/{unit}/manual-qa/{unit}-manual-qa-results.md`:

```markdown
# Manual QA Results — {unit}

**Generated at**: <ISO>     **Tier**: <…>
**Iteration count**: <n> of max 3

## Summary
| Category | Count |
|----------|-------|
| Scenarios PASS | <n> |
| Scenarios FAIL (now resolved) | <n> |
| Scenarios N/A | <n> |
| Bugs logged | <n> |
| Bugs FIXED | <n> |
| Bugs REJECTED | <n> |
| Bugs OPEN | 0 (must be 0 to reach this state) |

## Verdict
- ✅ All-PASS — eligible for /grill-me-2 + Gate #4 countersign
- ❌ Failed — must NOT appear; if Bugs OPEN > 0, this file is not generated

## Per-scenario summary
| Scenario | Final state | BR | Tested by |
|----------|-------------|----|-----------|
| 1 | PASS | BR-001 | <name> |
| 2 | PASS | BR-002 | <name> |
| … | … | … | … |
```

---

## Stage Checklist (`{unit}-manual-qa-checklist.md` — note this is also the per-scenario file from Step 1)

The same file serves both as the checklist artifact and the scenario list. The pod is signing off the scenarios, not a separate meta-checklist.

Validation rule (enforced by the AI at Step 4):
- Every scenario has a final state of `PASS` or `N/A` (no PENDING, no FAIL)
- Every Bug has a final status of `FIXED` or `REJECTED` (no OPEN, no IN-PROGRESS)
- Every `N/A` and `REJECTED` has a non-vague reason
- `aidlc-state.md` updated: Stage 14 → COMPLETE for {unit}

---

## Completion Message

### When all-PASS

```markdown
# Manual QA — {unit} — Complete ✅

**Scenarios**: <n_pass> PASS / <n_na> N/A / 0 FAIL / 0 PENDING
**Bugs**: <n_fixed> FIXED / <n_rejected> REJECTED / 0 OPEN
**Iteration**: <n> of max 3

> **🚀 WHAT'S NEXT?**
>
> ✅ Continue — fire `/grill-me-2` (mandatory pre-Gate-#4 sub-ritual)
```

### When bug-loop is active

```markdown
# Manual QA — {unit} — BUG-LOOP CYCLE <n>

**Open/In-progress bugs**: <n>
- BUG-{unit}-001 (Critical): <title>
- BUG-{unit}-002 (High): <title>

Returning to Stage 12b (Code Generation Part 2) to address findings.
After fix → re-run Stage 13 Code Review → re-run Stage 14 Manual QA.

Cycle cap: 3. After cycle 3, the AI escalates to Functional Design re-work.
```

### When cycle 3 exhausted

```markdown
# Manual QA — {unit} — ESCALATION ⚠️

**Cycle 3 exhausted with bugs still open**:
- BUG-{unit}-005 (High): <title>

The FR itself is likely the problem. Recommended next steps:
1. Pause Stage 14.
2. Open `business-rules.md` for {unit} and review BRs <list> with the pod.
3. Revise FR (Stage 8) → revise NFR (Stage 9) → re-run `/grill-me-1` → re-run Stage 10–13 → return to Stage 14 with a fresh cycle counter.

Pod sign-off required before escalation proceeds.
```

---

## ⛔ Hand-off to `/grill-me-2`

Manual QA all-PASS does NOT yet trigger pod countersign on `{unit}-code-review-signoff.md`. The workflow advances to the `/grill-me-2` sub-ritual (`construction/grill-me-2.md`). Only after Grill-Me #2 PASS does the pod countersign Gate #4.

The Gate #4 verdict block (`common/approval-gates.md` § Gate #4) now contains two extra rows that the AI fills here:
- `Manual QA (per UoW)` ← ✅ All-PASS / ❌ Fail (open bugs)
- `Grill-Me #2 (per UoW)` ← filled later by the `/grill-me-2` ritual

Validation Rules 7 + 8 in `common/approval-gates.md` § "AI-DLC Verdict Validation (Gate #4 only)" enforce both rows.

---

## Anti-patterns

- ❌ Pod marking all scenarios PASS without actually running them — Manual QA is attestation but it is real attestation, not box-ticking
- ❌ Logging a bug then accepting a "no-repro" close from the AI without re-running the scenario in the dev environment
- ❌ Pod countersigning Gate #4 with one or more Bugs OPEN — Validation Rule 7 forbids this
- ❌ Looping past 3 cycles instead of escalating — at cycle 3 the FR is the suspect, not the code
- ❌ Treating Manual QA as a sub-step of Stage 13 Code Review — it is its own stage (14), its own checklist, its own completion message
- ❌ Skipping Manual QA on Bugfix Tier — the scope narrows, but the stage NEVER skips
- ❌ Marking a scenario `[~] N/A` with a vague reason like "not needed" — N/A reasons must name the blocker specifically (e.g., "depends on payment provider sandbox; currently down")
