# Services

Orchestration / domain services that coordinate components.

---

## Backend services

### `AuthService` — orchestrates signup, login, refresh, logout

**Coordinates**: `UserRepo`, `RefreshTokenRepo`, `PasswordHasher`, `JwtSigner`, `EmailStub`, `Logger`.

#### Signup flow

```
1. validate input (email format, password length)
2. UserRepo.findByEmail(email)
   if exists → throw invalidCredentialsError (NFR-S09 enumeration-safe — SAME shape as login fail)
3. PasswordHasher.hash(password)
4. UserRepo.create({email, display_name, password_hash, verified: true, account_setup_completed: false})
5. EmailStub.send({...})    ← stub: just logs JSON to stdout (B4=A)
6. Build new family_id (UUID v4)
7. JwtSigner.signAccessToken({user_id})    → access_token
8. JwtSigner.signRefreshToken({user_id, family_id})  → refresh_token
9. RefreshTokenRepo.create({user_id, family_id, token_hash: sha256(refresh_token), parent_id: null, expires_at: now+7d})
10. return { user, cookies: { access: access_token, refresh: refresh_token } }
```

#### Login flow

```
1. validate input
2. RateLimitMiddleware already enforced upstream (5/15min per email) — service trusts that
3. UserRepo.findByEmail(email)
   if not found → throw invalidCredentialsError
4. PasswordHasher.verify(password, user.password_hash)
   if false → record failure in in-memory counter (already done by middleware); throw invalidCredentialsError
5. Build new family_id (UUID v4) — new login starts a fresh family
6. Same token-minting steps 7-9 as signup
7. return { user, cookies }
```

#### Refresh flow

```
1. token_hash = sha256(presentedRefreshToken)
2. RefreshTokenRepo.findByTokenHash(token_hash)
   if not found → throw 401
3. row = found
4. if row.expires_at < now → throw 401
5. if row.revoked → throw 401
6. if row.rotated_at IS NOT NULL → /* replay! */ RefreshTokenRepo.revokeFamily(row.family_id); throw 401
7. mint new refresh_token with same family_id
8. RefreshTokenRepo.rotate(row.id, newRow)    ← atomic: sets old.rotated_at AND inserts new
9. mint new access_token
10. return { user, cookies }
```

#### Logout flow

```
1. if cookie missing → return 204 (idempotent)
2. token_hash = sha256(presentedRefreshToken)
3. RefreshTokenRepo.findByTokenHash(token_hash)
   if found AND NOT row.revoked → RefreshTokenRepo.revokeFamily(row.family_id)
4. respond with Set-Cookie: access=; Max-Age=0 + refresh=; Max-Age=0
5. return 204
```

---

### `UserService` — profile management

**Coordinates**: `UserRepo`, `Logger`.

```
getMe(user_id):
  user = UserRepo.findById(user_id)
  if not found → throw 401 (treat as session-invalid)
  return sanitize(user)    ← strip password_hash; never returned

updateProfile(user_id, { display_name, timezone }):
  validate display_name (non-empty, ≤ 100 chars)
  validate timezone (must be a valid IANA name)
  user = UserRepo.update(user_id, { display_name, timezone, account_setup_completed: true })
  return sanitize(user)
```

---

## Frontend services

### `AuthClient` — wraps `ApiClient` with auth-flow side effects

```
signup(input):
  user = await api.authSignup(input)
  cache.set('me', user)
  router.navigate('/account-setup')

login(input):
  user = await api.authLogin(input)
  cache.set('me', user)
  router.navigate(user.account_setup_completed ? '/dashboard' : '/account-setup')

logout():
  await api.authLogout()
  cache.clear()
  router.navigate('/')
  toast.show('Signed out')

silentRefresh():    // called by interceptor on 401
  await api.authRefresh()    // sets new cookies
  cache.invalidate('me')
```

---

## Cross-cutting concerns

### Request-ID propagation

- BE generates a UUIDv4 `request_id` per request (unless a valid W3C `traceparent` is present).
- `request_id` is attached to every log line for that request (NFR-O04).
- `request_id` is returned to the FE as a response header `X-Request-Id`.
- FE includes `X-Request-Id` in any subsequent log / error report from the same logical operation.

### Time

- Server clock is UTC.
- The user's `timezone` is persisted on the user row (`Asia/Kolkata` default).
- v1 does not render dates in the UI, so timezone has no display impact yet — but the column is in place for v2.

### Configuration

| Env var | Required | Purpose |
|---------|----------|---------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `JWT_PRIVATE_KEY` | Yes (PEM, RS256) | JWT signing |
| `JWT_PUBLIC_KEY` | Yes (PEM, RS256) | JWT verification + JWKS endpoint |
| `FE_ORIGIN` | Yes | CORS allow-list (single value) |
| `APP_ENV` | Yes (`dev` / `ci` / `prod`) | Toggles strictness (e.g., Secure cookie flag in non-dev) |
| `LOG_LEVEL` | No (default `info`) | Logger level |
| `PORT` | No (default 4000) | BE listen port |

Backend fails fast on startup if any **Required** var is missing.
