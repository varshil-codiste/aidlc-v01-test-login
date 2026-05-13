# Component Methods

Method signatures for non-trivial components. Types are pseudo-code (Stage 11 will resolve to TS / Python / Go). Only methods that span > 1 simple line are listed.

---

## Frontend

### `ApiClient` (typed; generated from OpenAPI)

```ts
class ApiClient {
  // generated per path × method by openapi-typescript or framework equivalent
  authSignup(body: SignupRequest): Promise<UserResponse>;
  authLogin(body: LoginRequest): Promise<UserResponse>;
  authRefresh(): Promise<UserResponse>;
  authLogout(): Promise<void>;
  usersGetMe(): Promise<UserResponse>;
  usersUpdateMeProfile(body: UpdateProfileRequest): Promise<UserResponse>;

  // hand-written: silent-refresh interceptor
  private async withSilentRefresh<T>(call: () => Promise<T>): Promise<T>;
}
```

Behavior of `withSilentRefresh`: on HTTP 401 from a protected call, call `/auth/refresh` exactly once, then retry the original call. If refresh ALSO returns 401, throw and let the FE redirect to `/`.

### `useAuth` hook

```ts
function useAuth(): {
  user: User | null;     // shaped from GET /users/me
  isLoading: boolean;
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  login(input: { email: string; password: string }): Promise<void>;
  signup(input: SignupRequest): Promise<void>;
  logout(): Promise<void>;
};
```

### `AuthGuard`

```ts
function AuthGuard({ children, requireSetupComplete = true }): JSX.Element {
  // 1. read /users/me via useAuth
  // 2. if loading → render skeleton
  // 3. if no user → redirect '/'
  // 4. if user && requireSetupComplete && !user.account_setup_completed → redirect '/account-setup'
  // 5. else render children
}
```

---

## Backend

### `AuthController`

```ts
class AuthController {
  POST '/auth/signup'(req: SignupRequest): Promise<{ user: UserDto; cookies: { access, refresh } }>;
  POST '/auth/login'(req: LoginRequest):   Promise<{ user: UserDto; cookies: { access, refresh } }>;
  POST '/auth/refresh'():                  Promise<{ user: UserDto; cookies: { access, refresh } }>;
  POST '/auth/logout'():                   Promise<void>;
}
```

All four methods:
1. Validate request body via schema (or 400 problem+json).
2. Delegate to `AuthService`.
3. On success, the controller sets `Set-Cookie` headers for both tokens.
4. On failure, return RFC 7807 error envelope with `request_id`.

### `UserController`

```ts
class UserController {
  GET   '/users/me'():                                Promise<UserDto>;
  PATCH '/users/me/profile'(req: UpdateProfileRequest): Promise<UserDto>;
}
```

Both methods require an authenticated request (`AuthMiddleware`).

### `AuthService`

```ts
class AuthService {
  // SignupOutcome carries the user + the two cookie values (controllers set them on the response)
  async signup(input: SignupRequest): Promise<SignupOutcome>;
  async login(input: LoginRequest):   Promise<LoginOutcome>;

  /**
   * Verifies the presented refresh token AND its family.
   * If valid AND not previously rotated → rotates, returns new pair.
   * If valid BUT already rotated (replay) → revokes the entire family, throws.
   * If invalid → throws.
   */
  async refresh(presentedRefreshToken: string): Promise<RefreshOutcome>;

  async logout(presentedRefreshToken: string): Promise<void>;

  // Account-enumeration-safe error builder — returns the same RFC 7807 body
  // whether the cause was "email already exists" (signup) or "wrong password" (login).
  private invalidCredentialsError(): ProblemJson;
}
```

### `PasswordHasher`

```ts
class PasswordHasher {
  async hash(plain: string): Promise<string>;             // returns "$argon2id$..." encoded
  async verify(plain: string, hash: string): Promise<boolean>;
}
```

### `JwtSigner`

```ts
class JwtSigner {
  // Loaded at bootstrap from JWT_PRIVATE_KEY / JWT_PUBLIC_KEY env vars
  constructor(privateKey: PEM, publicKey: PEM);

  async signAccessToken(claims: AccessClaims): Promise<string>;        // 15-min exp
  async signRefreshToken(claims: RefreshClaims): Promise<string>;      // 7-day exp; includes family_id
  async verify(token: string): Promise<AccessClaims | RefreshClaims>;  // throws on invalid/expired

  jwks(): { keys: JWK[] };                                              // exposed at /.well-known/jwks.json
}
```

### `EmailStub`

```ts
class EmailStub {
  send(input: { to: string; subject: string; body: string; verificationToken: string }): void {
    // writes a single JSON line to stdout — never throws
    logger.info('email_verification_stub', input);
  }
}
```

### `RefreshTokenRepo`

```ts
class RefreshTokenRepo {
  async create(input: { user_id; family_id; token_hash; parent_id?; expires_at }): Promise<RefreshTokenRow>;
  async findByTokenHash(hash: string): Promise<RefreshTokenRow | null>;
  async rotate(currentRowId: string, newRow: NewRefreshTokenInput): Promise<RefreshTokenRow>;
  async revokeFamily(family_id: string): Promise<void>;
  async deleteExpired(): Promise<number>;  // run by a cron or on-demand maintenance task
}
```

---

## Middleware contracts

```ts
// Order matters: RequestIdMiddleware first; ErrorEnvelopeMiddleware last (outermost).
type Middleware = (req, res, next) => void;

const order: Middleware[] = [
  RequestIdMiddleware,    // generate or pass-through request_id
  LoggerMiddleware,       // emit start + end log lines with request_id
  CorsMiddleware,         // allow configured FE origin only
  AuthMiddleware,         // populate ctx.user when access cookie valid (no-op when missing)
  RateLimitMiddleware,    // applied to /auth/login only
  ValidationMiddleware,   // schema-validate req body/query/params
  // ... controllers
  ErrorEnvelopeMiddleware // catches any uncaught error → RFC 7807
];
```
