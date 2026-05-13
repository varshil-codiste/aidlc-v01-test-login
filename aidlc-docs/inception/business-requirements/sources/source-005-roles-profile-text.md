# Source 005 — Roles + Profile feature (plain text in chat)

**Captured**: 2026-05-12T19:35:00+05:30
**Format**: plain text (chat message)
**UoW**: roles-profile (new Feature-tier UoW on top of `auth`)

---

> Using AI-DLC I want to introduce two user merchant and seller in signup and login flow. AFter successfull login we need to saw the profile with logout functionality.

---

## AI-DLC intake parsing
| Feature ask | Maps to |
|-------------|---------|
| Two user types: merchant + seller | New `role` concept on the User entity; signup/login become role-aware |
| Both appear in signup flow | Role selection during signup (mechanism TBD — see BR question Q2) |
| Both appear in login flow | Login is role-aware (response shape may differ by role; redirect target may differ) |
| Show the profile after successful login | New `/profile` route — replaces or augments existing `/dashboard` (see Q5) |
| Logout from profile | Already implemented in `auth` UoW (US-005); same Logout button reused on `/profile` |

## Gaps surfaced (turned into BR-intake questions)
- Role-determination mechanism (user-selected vs admin-assigned vs domain-detected)
- Profile content same vs role-specific
- Role-specific signup fields (business_name for merchant, etc.)
- Coexistence of `/dashboard` and `/profile`
- Migration story for existing auth-UoW users (no role yet)
- Role-based access control scope for v1
