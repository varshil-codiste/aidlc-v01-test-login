# Tier Detection Questions

The Tier you select drives the size of the Business Requirements checklist and which downstream stages run. See `.aidlc/aidlc-rule-details/common/tiered-mode.md`.

> **AI-DLC suggestion**: Workspace Detection found an empty workspace (no source files, no build configs), and the user's chat input says "I want to build a small login + account setup feature" — this is a **new product** even though the scope is small. Recommended Tier is **Greenfield**.

---

## Question 1
What kind of work are we starting?

A) New project / new product (Greenfield) **(Recommended — empty workspace, new product)**
B) New feature on an existing product (Feature)
C) Bug fix / patch / hotfix (Bugfix)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 2 (Bugfix only — skip if you answered A or B above)
Is this bugfix flagged severity-1 (production down or critical incident)?

A) Yes — severity-1 hotfix
B) No — standard defect
X) Other (please describe after [Answer]: tag below)

[Answer]:

---

Fill in `[Answer]:` and reply **done** when complete. I'll then immediately open `input-format-questions.md` so you can keep the momentum.
