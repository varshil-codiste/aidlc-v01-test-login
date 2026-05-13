# Component Dependency

**Generated**: 2026-05-12T00:11:00Z

## Backend dependency graph (Mermaid)

```mermaid
flowchart LR
    subgraph Boot
      Bootstrap
    end
    subgraph Middleware
      ReqId[RequestIdMiddleware]
      LogMW[LoggerMiddleware]
      Cors[CorsMiddleware]
      Auth[AuthMiddleware]
      Rate[RateLimitMiddleware]
      Val[ValidationMiddleware]
      Err[ErrorEnvelopeMiddleware]
    end
    subgraph Controllers
      AC[AuthController]
      UC[UserController]
      HC[HealthController]
      JC[JwksController]
    end
    subgraph Services
      AS[AuthService]
      US[UserService]
      PH[PasswordHasher]
      JS[JwtSigner]
      ES[EmailStub]
    end
    subgraph Repos
      UR[UserRepo]
      RR[RefreshTokenRepo]
    end
    subgraph Stores
      PG[(Postgres)]
      STDOUT[("stdout")]
    end

    Bootstrap --> ReqId --> LogMW --> Cors --> Auth --> Rate --> Val
    Val --> AC & UC & HC & JC
    AC --> AS
    UC --> US
    JC --> JS
    AS --> UR & RR & PH & JS & ES
    US --> UR
    UR --> PG
    RR --> PG
    JS -.JWKS.-> JC
    ES --> STDOUT
    LogMW --> STDOUT
    Err -.outermost catch.-> AC & UC & HC & JC

    classDef mw fill:#dbeafe,stroke:#2563eb,color:#0a0a0a
    classDef ctrl fill:#dcfce7,stroke:#16a34a,color:#0a0a0a
    classDef svc fill:#fef9c3,stroke:#ca8a04,color:#0a0a0a
    classDef repo fill:#fae8ff,stroke:#a21caf,color:#0a0a0a
    classDef store fill:#f3f4f6,stroke:#9ca3af,color:#0a0a0a
    class ReqId,LogMW,Cors,Auth,Rate,Val,Err mw
    class AC,UC,HC,JC ctrl
    class AS,US,PH,JS,ES svc
    class UR,RR repo
    class PG,STDOUT store
```

## Frontend dependency graph

```mermaid
flowchart LR
    App --> Router
    Router --> LandingPage
    Router --> SignupPage
    Router --> AccountSetupPage
    Router --> DashboardPage
    LandingPage --> BrandPanel
    LandingPage --> FormInput
    LandingPage --> PrimaryButton
    LandingPage --> OutlinedButton
    LandingPage --> FormError
    SignupPage --> FormInput
    SignupPage --> PrimaryButton
    SignupPage --> FormError
    AccountSetupPage --> FormInput
    AccountSetupPage --> PrimaryButton
    AccountSetupPage --> FormError
    DashboardPage --> PrimaryButton
    DashboardPage --> useAuth
    AuthGuard --> useAuth
    Router --> AuthGuard
    useAuth --> ApiClient
    SignupPage --> ApiClient
    LandingPage --> ApiClient
    AccountSetupPage --> ApiClient
    DashboardPage --> Toast
    LogoutAction --> ApiClient
    LogoutAction --> Toast
    ApiClient -.silent refresh.-> ApiClient
```

## Cross-stack edges (dashed)

```mermaid
flowchart LR
    subgraph FE
      ApiClient_FE[ApiClient]
    end
    subgraph BE
      AC[AuthController]
      UC[UserController]
      HC[HealthController]
      JC[JwksController]
    end

    ApiClient_FE -. POST /auth/signup .-> AC
    ApiClient_FE -. POST /auth/login .-> AC
    ApiClient_FE -. POST /auth/refresh .-> AC
    ApiClient_FE -. POST /auth/logout .-> AC
    ApiClient_FE -. GET /users/me .-> UC
    ApiClient_FE -. PATCH /users/me/profile .-> UC
    ApiClient_FE -. GET /health .-> HC
    ApiClient_FE -. GET /.well-known/jwks.json .-> JC
```

All cross-stack edges are documented in **OpenAPI 3.1** at `apps/backend/openapi.yaml` (path TBD per Stage 11).

---

## Dependency matrix (component → component)

The matrix below is "what depends on what". Row depends on column. ✓ = depends on. — = no direct dependency.

### Backend

| ↓ depends on / column → | UserRepo | RefreshTokenRepo | PasswordHasher | JwtSigner | EmailStub | Logger |
|--------------------------|:--------:|:----------------:|:--------------:|:---------:|:---------:|:------:|
| **AuthController**        | — | — | — | — | — | ✓ |
| **UserController**        | — | — | — | — | — | ✓ |
| **AuthService**           | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **UserService**           | ✓ | — | — | — | — | ✓ |
| **UserRepo**              | — | — | — | — | — | ✓ |
| **RefreshTokenRepo**      | — | — | — | — | — | ✓ |
| **Middleware (all)**      | — | — | — | (Auth only ✓) | — | ✓ |

### Frontend

| ↓ depends on / column → | useAuth | ApiClient | Toast | Router |
|--------------------------|:-------:|:---------:|:-----:|:------:|
| **App**                   | — | — | — | ✓ |
| **AuthGuard**             | ✓ | — | — | ✓ |
| **LandingPage**           | — | ✓ | — | — |
| **SignupPage**            | — | ✓ | — | — |
| **AccountSetupPage**      | — | ✓ | — | — |
| **DashboardPage**         | ✓ | — | — | — |
| **LogoutAction**          | — | ✓ | ✓ | ✓ |

---

## Forbidden dependencies

| Forbidden | Why |
|-----------|-----|
| Controllers → Repositories (directly) | Must go through Services for testability + transaction control |
| Repositories → Services | Repos are pure data access; coordinating multi-repo work belongs in services |
| `EmailStub` → real SMTP library | v1 is stub-only (BR § 1.4) — `EmailStub` is the boundary |
| FE component → raw `fetch` (bypassing `ApiClient`) | Centralizes silent-refresh + cookie semantics; bypass breaks NFR-S10 testability |
| Any module → `process.env` directly | Env reading happens once in `bootstrap`; configured config object is injected (testability + fail-fast) |
| Test code → real Postgres in unit tests | Unit tests use repo doubles; integration tests use the docker-compose Postgres |
