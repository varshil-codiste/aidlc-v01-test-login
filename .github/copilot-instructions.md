# AI-DLC — GitHub Copilot Instructions

This repository follows the **AI-DLC workflow**. When users ask Copilot to work on software development tasks here, follow these rules.

---

## Trigger

The AI-DLC workflow activates when the user begins a request with **"Using AI-DLC, ..."**.

For other software-development requests, ASK whether the user wants AI-DLC before applying any default behavior.

---

## Where the Rules Live

Rules are organized in `.aidlc/aidlc-rule-details/`:

```
common/         — cross-cutting rules (gates, tiers, pod, checklists, depth, validation)
inception/      — 9 stages (Workspace Detection → Units Generation)
construction/   — 8 stages + stacks/ (Functional Design → Manual QA → Build & Test, with stack conventions + /grill-me-1 and /grill-me-2 sub-rituals)
operations/     — 4 stages (Deployment / IaC / Observability / Production Readiness)
extensions/     — opt-in extensions (Security / PBT / AI-ML / Accessibility)
```

Entry point: `.aidlc/aidlc-rules/core-workflow.md`

---

## Mandatory Behaviors

1. **Five sign-off gates**: Gates #1–#5 each require a signed `*-signoff.md` file before the workflow advances. Gate #4 (Code Review) is hybrid: AI emits a PROCEED/BLOCK verdict at Stage 13, then Stage 14 (Manual QA) and the `/grill-me-2` sub-ritual must both PASS before the pod countersigns.
2. **Tiered execution**: User picks Greenfield / Feature / Bugfix at Stage 1. Tier drives checklist size, stage selection, default depth.
3. **Pod ritual**: 1 Tech Lead + 1 Dev sign every gate (named in `pod.md`). Async sign-off is allowed.
4. **Questions in files, not chat**: All clarifying questions are written to `.md` files with multiple-choice options + `X) Other` + `[Answer]:` tags.
5. **App code in workspace root, artifacts in `aidlc-docs/`**.
6. **Audit log everything** to `aidlc-docs/audit.md` with ISO 8601 timestamps; never summarize raw user input.
7. **Plan checkboxes**: mark `[x]` immediately after completing each step.

---

## Stack Coverage

Conventions for FE / Node / Python / Go / Flutter live in `construction/stacks/`. Framework choice within each stack is made per Unit of Work at Stage 11 (Stack Selection) — no defaults.

---

## Extensions

Opt-in during Stage 4 (Requirements Analysis):
- Security baseline (15 OWASP rules)
- Property-based testing
- AI/ML lifecycle (prompt management, evals, RAG, guardrails)
- Accessibility WCAG 2.2 AA

Opted-in extensions become blocking findings at Gate #4 and Gate #5.

---

For the full workflow definition, load `.aidlc/aidlc-rules/core-workflow.md` at the start of any AI-DLC session.
