# Flowboard

A full-stack kanban board application, built as a TypeScript monorepo.
**Current stage: authentication** (registration, login, silent session refresh,
protected routes). Boards, lists and cards are next.

## Highlights

- **Secure session design**: short-lived JWT access token (kept only in memory)
  plus a rotating, hashed refresh token in an `httpOnly` cookie, with
  reuse (theft) detection.
- **One validation schema, two apps**: Zod schemas live in a shared package and
  validate the same rules in the browser and on the server.
- **Typed end to end**: strict TypeScript across API, web and shared code.
- **Modern stack**: Node.js, Express 5, PostgreSQL, Prisma 8, Vue 3, Pinia,
  Tailwind CSS 4, with light/dark theme.

## Tech stack

| Layer    | Technologies                                               |
| -------- | ---------------------------------------------------------- |
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS 4 |
| Backend  | Node.js, Express 5, TypeScript, Zod, argon2, jose (JWT)    |
| Database | PostgreSQL 17 (Docker), Prisma 8 (release candidate)       |
| Tooling  | pnpm workspaces, ESLint (flat config), Prettier            |

## Project structure

```
flowboard/
├── apps/
│   ├── api/        # Express API: modules/auth, common middleware, Prisma contract
│   └── web/        # Vue app: views, Pinia store, API client, router
├── packages/
│   └── shared/     # @app/shared: Zod schemas and types used by api and web
├── docker-compose.yaml   # PostgreSQL
└── pnpm-workspace.yaml
```

The API follows a simple layering per module: **routes** (URLs and middleware)
→ **controller** (HTTP in/out) → **service** (business logic and database).

## Authentication design

| Token   | What it is                          | Lifetime | Where it lives                                                                 |
| ------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------ |
| Access  | Signed JWT (HS256), `sub` = user id | 15 min   | JS memory only; sent as `Authorization: Bearer`                                |
| Refresh | Random 48 bytes, base64url          | 30 days  | `httpOnly` cookie scoped to `/auth`; only its SHA-256 hash is stored in the DB |

```mermaid
sequenceDiagram
    participant B as Browser (Vue)
    participant A as API (Express)
    participant D as PostgreSQL

    B->>A: POST /auth/login (email, password)
    A->>D: find user, verify argon2 hash
    A->>D: store SHA-256(refresh token)
    A-->>B: access token (body) + refresh token (httpOnly cookie)

    B->>A: GET /auth/me (Bearer access)
    A-->>B: 401 (access expired)
    B->>A: POST /auth/refresh (cookie sent automatically)
    A->>D: mark old refresh token as revoked, store the new one
    A-->>B: new access token + new refresh cookie
    B->>A: GET /auth/me (retry with new access)
    A-->>B: 200
```

### Security decisions

- **Passwords** are stored only as **argon2** hashes. Login returns the same
  error for an unknown email and a wrong password.
- **Refresh token rotation**: every refresh invalidates the used token and
  issues a new one.
- **Reuse detection**: presenting an already-used refresh token is treated as
  theft, and **all** of the user's refresh tokens are deleted.
- **No refresh token in JavaScript**: the `httpOnly` cookie cannot be read by
  injected scripts (XSS); `sameSite=lax` and `path=/auth` limit where it is sent.
- **Refresh tokens are hashed** in the database, so a database leak does not
  expose usable tokens.
- **Concurrent 401s are safe**: the web client serializes refresh calls with a
  mutex, otherwise parallel requests would reuse a rotated token and trigger
  the theft protection.
- **CORS** allows a single configured origin with `credentials: true`.
- **Session restore**: on page load the app calls `/auth/refresh`, so a reload
  keeps the user signed in without storing the access token anywhere.

### API

| Method | Path             | Auth   | Description                                |
| ------ | ---------------- | ------ | ------------------------------------------ |
| POST   | `/auth/register` | –      | Create an account, returns access + cookie |
| POST   | `/auth/login`    | –      | Sign in, returns access + cookie           |
| POST   | `/auth/refresh`  | cookie | Rotate refresh token, returns new access   |
| POST   | `/auth/logout`   | cookie | Delete the refresh token, clear the cookie |
| GET    | `/auth/me`       | Bearer | Current user                               |

Errors are returned as JSON: `{ "message": "...", "details": ... }`. Request
bodies are validated with Zod and rejected with `400` and per-field errors.

## Getting started

**Requirements:** Node.js 22+, pnpm, Docker.

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure the API
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL="postgresql://app:app@localhost:5432/trello?schema=public"
JWT_ACCESS_SECRET="<random 64-hex string>"
WEB_ORIGIN="http://localhost:5173"
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# 4. Create the database tables (from apps/api)
cd apps/api
pnpm prisma contract emit
pnpm prisma db init
cd ../..

# 5. Run API (http://localhost:4000) and web (http://localhost:5173) together
pnpm dev
```

### Scripts

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `pnpm dev`    | Run API and web in parallel              |
| `pnpm lint`   | Lint the whole workspace                 |
| `pnpm format` | Format the whole workspace with Prettier |

After changing `apps/api/src/prisma/contract.prisma`, run
`pnpm prisma contract emit` and then `pnpm prisma db update` from `apps/api`.

## Roadmap

- [x] Monorepo, tooling, shared validation package
- [x] Authentication with refresh token rotation
- [ ] Boards, lists and cards
- [ ] Drag and drop
- [ ] Tests and CI
