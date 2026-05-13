# Personas

## Persona 1: CodisteTeammate

**Role**: Internal Codiste engineer or designer using the v1 sandbox to walk through the AI-DLC workflow end-to-end. Same human in different journey states (not logged in, signed up but not set up, logged in, logging out).

**Goals**:
- Create an account quickly to dogfood the AI-DLC reference implementation.
- Sign in / out cleanly to validate the auth flow.
- See that the implementation matches the Figma design.
- Confirm that accessibility + security extensions actually fire as blocking constraints at Stages 13 / 14.

**Pain points**:
- Repetitive workflows that don't teach anything new about AI-DLC.
- Auth flows that store plaintext passwords or that leak account-existence (anti-patterns).
- UIs that fail on keyboard-only navigation or have low color contrast.

**Tech savviness**: **High** (Codiste engineers are technical; tutorial copy can assume competency).

**Devices**: Web (laptop primary; mobile-browser secondary). No native mobile in v1.

**Locale**: en-US, Asia/Kolkata timezone (default per `aidlc-profile.md`).

**Out-of-scope personas (carried for reference)**:
- External customer (BR § 1.2 confines to internal only)
- Admin (no admin UI in v1 per BR § 1.4)
- Stakeholder (out-of-band per pod-ritual.md; not a system user)

**Sources**: BR §§ 1.2, 1.5, 2.5; requirements.md § 1 (Intent Analysis); aidlc-profile.md (team, locale)
