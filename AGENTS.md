# AI-DLC — Generic Agent Instructions

This file is the generic-agent counterpart to `CLAUDE.md` and `.cursorrules`. Tools that read `AGENTS.md` (Cline, Continue, Aider, generic agent harnesses) should use this as the workflow contract.

---

## Trigger

AI-DLC activates when the user starts a request with **"Using AI-DLC, ..."**.

If the user requests software development without that trigger, ASK whether to use AI-DLC before applying any default behavior.

---

## Boot Sequence (run in order on every workflow invocation)

1. **Resolve rule details directory** — use the first that exists:
   - `.aidlc/aidlc-rule-details/`
   - `.kiro/aidlc-rule-details/`
   - `.amazonq/aidlc-rule-details/`
2. **Load entry point**: `.aidlc/aidlc-rules/core-workflow.md`
3. **Load common rules** (15 files): `common/welcome-message.md`, `process-overview.md`, `tiered-mode.md`, `pod-ritual.md`, `approval-gates.md`, `checklist-conventions.md`, `session-continuity.md`, `content-validation.md`, `question-format-guide.md`, `depth-levels.md`, `overconfidence-prevention.md`, `error-handling.md`, `workflow-changes.md`, `terminology.md`, `ascii-diagram-standards.md`
4. **Scan extensions** under `extensions/` recursively, load ONLY `*.opt-in.md` (defer full rule files until user opts in)
5. **Display** the welcome message from `common/welcome-message.md` exactly ONCE
6. **Run** `inception/workspace-detection.md` (Stage 0)

---

## Hard Constraints

| Constraint | Enforcement |
|------------|-------------|
| Questions to user MUST be in `.md` files (never in chat) | `common/question-format-guide.md` |
| Five sign-off gates required before advancing | `common/approval-gates.md` |
| Pod = 1 Tech Lead + 1 Dev (named in `pod.md`) | `common/pod-ritual.md` |
| Tier (greenfield/feature/bugfix) set at Stage 1 drives everything else | `common/tiered-mode.md` |
| App code in workspace root; artifacts in `aidlc-docs/` | `core-workflow.md` § Directory Structure |
| Every user input + AI response logged to `audit.md` (ISO 8601, raw) | `core-workflow.md` § Audit |
| Plan checkboxes marked `[x]` immediately after completing each step | `core-workflow.md` § Plan-Level Checkbox Enforcement |

---

## The 19 Stages and 5 Gates

```
INCEPTION  (8 stages)            CONSTRUCTION  (8 stages)              OPERATIONS  (4 stages)
─────────                         ────────────                           ──────────
0. Workspace Detection            8.  Functional Design (cond/UoW)       16. Deployment Guide
1. Business Requirements (GATE 1) 9.  NFR Requirements    (cond/UoW)     17. IaC                    (cond)
2. Design Intake (optional)           └ /grill-me-1 (sub)                18. Observability Setup    (cond)
3. Reverse Engineering (brownfd)  10. NFR Design          (cond/UoW)     19. Production Readiness   (GATE 5)
4. Requirements Analysis          11. Stack Selection     (always/UoW)
5. User Stories       (cond)      12. Code Generation     (GATE 3/UoW)
6. Application Design (cond)      13. Code Review         (AI verdict/UoW)
7. Workflow Planning  (GATE 2)    14. Manual QA           (always/UoW)
   └ Units Generation (cond)         └ /grill-me-2 (sub)
                                       (GATE 4 countersign)
                                  15. Build & Test
```

Gate #4 (Code Review) is unique — the AI emits a PROCEED/BLOCK verdict from automated lint + security + tests + AI review at Stage 13, then Stage 14 (Manual QA) fills the Manual QA row and the `/grill-me-2` sub-ritual fills the Grill-Me #2 row. Pod countersigns only after all six rows are green. See `construction/code-review.md`, `construction/manual-qa.md`, and `construction/grill-me-2.md`.

---

## Stack Coverage

AI-DLC supports these stacks out of the box, with conventions in `construction/stacks/`:

| Stack | Conventions file |
|-------|------------------|
| Frontend (React / Next.js / Vue / Astro) | `frontend-conventions.md` |
| Backend Node.js (NestJS / Express / Fastify / Hono) | `node-conventions.md` |
| Backend Python (FastAPI / Django / Flask / LiteStar) | `python-conventions.md` |
| Backend Go (chi / Gin / Fiber / Echo) | `go-conventions.md` |
| Mobile Flutter (Riverpod / BLoC / Provider) | `flutter-conventions.md` |

The framework choice within each stack is made per-UoW at Stage 11 (`construction/stack-selection.md`) — no defaults.

---

## Extensions (opt-in at Stage 4)

| Extension | Opt-in file |
|-----------|-------------|
| Security baseline (15 OWASP-aligned rules) | `extensions/security/baseline/security-baseline.opt-in.md` |
| Property-based testing (10 rules) | `extensions/testing/property-based/property-based-testing.opt-in.md` |
| AI/ML lifecycle (prompt mgmt, evals, RAG, guardrails) | `extensions/ai-ml/lifecycle/ai-ml-lifecycle.opt-in.md` |
| Accessibility WCAG 2.2 AA | `extensions/accessibility/wcag22-aa/accessibility.opt-in.md` |

Opted-in rules become blocking findings at Code Review (Gate #4) and Production Readiness (Gate #5).

---

## What This Workflow Does NOT Do

- Bake in framework defaults (Node / Python / Go / Flutter / FE)
- Run questions in chat (always `.md` files)
- Advance past a gate with a missing or stale signoff file
- Allow auto-skip of mandatory stages (0, 1, 4, 7, 11, 12, 13, 14, 15, 18)
- Allow Code Review (Gate #4) to be skipped — its AI verdict is mandatory regardless of Tier

---

## Adoption Checklist for a New Project

- [ ] Copy `.aidlc/` into the project root
- [ ] Copy `CLAUDE.md` (Claude Code) and/or `.cursorrules` (Cursor) and/or `AGENTS.md` (this file) — pick the ones your team uses
- [ ] Create `aidlc-docs/` (the workflow will do this on first run; you can pre-create if you want)
- [ ] Open the project in your AI-assisted IDE
- [ ] Type: `Using AI-DLC, <your business need>`

The workflow does the rest.
