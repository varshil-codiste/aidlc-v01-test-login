# Story Planning Questions

Four lightweight decisions that shape `personas.md` + `stories.md`. Each has a Recommended answer derived from the BR (single internal-user persona) and the Codiste preset.

---

## Question 1 — Persona count
How many personas does v1 support?

A) **One** — `CodisteTeammate` (internal user). All flows (signup, login, setup, dashboard, logout) describe the same human in different journey states. **(Recommended — BR § 1.2 confines users to internal Codiste teammates only)**
B) Two — split into `FirstTimeTeammate` (pre-signup) and `ReturningTeammate` (post-signup)
C) Three or more — add Admin / Stakeholder / Anonymous Visitor
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2 — Story grouping axis
How should stories be ordered in `stories.md`?

A) By user journey (Discover → Register → Setup → Use → Leave) **(Recommended — single persona, journey-based reads naturally)**
B) By feature area (Auth / Account / Dashboard / Ops)
C) By persona (only useful with multi-persona answer to Q1)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3 — Acceptance-criteria style
How should each story's acceptance criteria be written?

A) **Given-When-Then** (BDD-style) — most testable; maps cleanly to Stage 14 Manual QA and Stage 13 integration tests **(Recommended)**
B) Bullet list of expected behaviors
C) Behavior table (input × expected output)
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4 — Estimation style
How do we size each story?

A) **T-shirt sizes** — XS / S / M / L / XL (Codiste convention; rough but fast) **(Recommended)**
B) Story points (1 / 2 / 3 / 5 / 8 / 13 / 21)
C) Story counts only (no sizing — every story is "one bolt")
X) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Fast path
If all 4 Recommended answers fit (the typical thin-slice answer set), reply **`approved`** (or **`done — accept all recommendations`**) and I'll:

1. Populate `story-generation-plan.md` with the answers, tick the planning checklist
2. Generate `personas.md` (1 persona: `CodisteTeammate`)
3. Generate `stories.md` (~8 stories, journey-ordered, Given-When-Then, t-shirt sized)
4. Generate `story-map.md` (Comprehensive depth)
5. Run INVEST self-check per story
6. Generate `user-stories-checklist.md`
7. Present the Stage 5 completion message and wait for Continue → Stage 6 (Application Design)

Or fill `[Answer]:` individually and reply **approved**.
