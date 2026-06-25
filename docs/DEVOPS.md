# DevOps & Deployment Guide 🚀🏗

![DevOps Version](https://img.shields.io/badge/devops-v1.0.0--beta-blue)

This document outlines the deployment strategy, CI/CD workflows, and environment management for the Voltpath PH platform.

## 🧑‍💻 Local Development (no external services required)

Local dev needs only **Node.js** and a container engine (**Docker or Podman**) — Supabase, a Google Maps key, and Supabase Auth are all optional. The API degrades gracefully without them; the **only hard dependency is a database**, which the container engine provides.

- **Database (required):** `npm run db:up` starts PostgreSQL 15 + PostGIS via `docker-compose.yml`, with credentials matching the `DB_*` defaults. The `db:*` scripts auto-detect Docker or Podman (`scripts/compose.mjs`). Leave `DATABASE_URL` unset/commented so the API uses the `DB_*` vars.
  - On macOS/Windows with **Podman**, start its VM once per session first: `podman machine start` (first time only: `podman machine init`). `npm run db:up` prints this hint if the machine isn't running. On Apple Silicon the PostGIS image runs under amd64 emulation (a harmless platform warning).
- **Google Maps key (optional):** unset → routes/distances use a haversine estimate (no live traffic/elevation).
- **Supabase Auth (optional):** `SUPABASE_JWT_SECRET` unset in non-production → auth is bypassed for local demos.
- **Open-Meteo (optional):** unreachable → the energy model uses a baseline temperature.

```bash
cp .env.example .env          # defaults already target the local Docker DB
npm run db:up                 # start PostgreSQL + PostGIS (npm run db:down to stop)
npm run dev                   # start api + web (+ shared) via Turborepo
cd apps/api && npm run seed   # (optional) populate EV models
```

## 🏗 Deployment Strategy

### 1. Platforms: Railway (compute) + Supabase (data & auth)

The canonical split is **Railway for application compute** and **Supabase for the database, authentication, and storage**. This keeps the operational surface small for the team and offloads the highest-risk concerns (password security, JWT issuance) to a managed service.

- **Railway** (`railway.json` at the repo root) hosts the compute services:
  - **`voltph-api`**: Node.js Express backend. Uses `DATABASE_URL` (the Supabase connection string) and requires `GOOGLE_MAPS_API_KEY` + Supabase keys (see Environment Management).
  - **`voltph-web`**: React/Vite SPA, served statically. Requires `VITE_API_URL` at build time. _(Optional best-practice: host the static SPA on Vercel/Netlify/Cloudflare Pages instead of a Railway container — a CDN serves static assets more efficiently and gives per-PR preview URLs. Railway-static remains a valid simpler option.)_
- **Supabase** hosts the data tier — it is **not** defined in `railway.json`:
  - **PostgreSQL 15 + PostGIS** — enable the extension once via the Supabase SQL editor: `CREATE EXTENSION IF NOT EXISTS postgis;`.
  - **Supabase Auth** — issues and manages user credentials/JWTs; the API verifies these tokens (see [Authentication](#-authentication-supabase-auth)).
  - **Connection from the API:** use the **session pooler (port 5432) or the direct connection** for the long-running Railway container. Avoid the transaction pooler (port 6543) — TypeORM relies on prepared statements that it does not support.

### 2. Backend API (`apps/api`)

- **Build Command:** `npx turbo run build --filter=api`
- **Start Command:** `npx turbo run start --filter=api`
- **Health Check:** `/health`

### 3. Frontend Web (`apps/web`)

- **Build Command:** `npx turbo run build --filter=web`
- **Start Command:** `npx turbo run start --filter=web` (Uses `serve` to host the `dist` folder)
- **Environment Variables:** Set `VITE_API_URL` during the build phase.

### 4. Frontend Mobile (`apps/mobile`)

- **Target Platform:** Expo Application Services (EAS).
- **Deployment Flow:**
  1. Install EAS CLI: `npm install -g eas-cli`
  2. Log in: `eas login`
  3. Configure project: `eas build:configure`
  4. Build for Android: `eas build --platform android`
  5. Build for iOS: `eas build --platform ios`
- **Internal Distribution:** Use `eas build --profile preview` to generate APKs/IPAs for testing.
- **OTA Updates:** Use `eas update` to push bug fixes without resubmitting to app stores.

## 🔄 CI/CD Workflows (GitHub Actions)

We use GitHub Actions for automated linting and testing.

### Testing Strategy

- **Unit & Integration:** Run `npm test` from the root to execute all tests across the monorepo.
- **API Tests:** Located in `apps/api/test`, powered by Jest. Verifies endpoint logic and cloud configurations.
- **Web Tests:** Located in `apps/web/test`, powered by Vitest. Verifies component behavior and environment config.

## 🌳 Branching Strategy (GitHub Flow)

We follow the **GitHub Flow** branching strategy to ensure code quality and stable releases:

1.  **Main Branch (`main`):**
    - Represents the production-ready state.
    - Protected: Direct pushes are disabled.
    - All changes must come through a Pull Request.

2.  **Feature & Fix Branches:**
    - `feat/feature-description`: For new features or enhancements.
    - `fix/bug-description`: For resolving bugs and issues.
    - `docs/topic`: For documentation-only changes.
    - `chore/task`: For maintenance and dependency updates.

3.  **Pull Request Process:**
    - Branches are created from the latest `main`.
    - Link the PR to the corresponding issue card on the [Voltpath PH Project Board](https://github.com/orgs/Team-Kaizen-MMDC/projects/5).
    - Open a PR early for feedback if needed (Draft PR).
    - At least one approval is required before merging.
    - CI checks (Linting, Build) must pass.
    - Merge using "Squash and Merge" to keep history clean.

## 🔐 Authentication (Supabase Auth)

Voltpath PH uses **Supabase Auth** rather than a self-built JWT system. This satisfies `NFR-05` (JWT on protected resources, credentials encrypted at rest, OWASP alignment) while offloading password hashing, token issuance/rotation, email verification, and optional OAuth to a managed, audited service.

- **Clients** (web/mobile) authenticate directly with Supabase Auth using `SUPABASE_URL` + `SUPABASE_ANON_KEY` and receive a JWT.
- **The API** treats requests as untrusted and **verifies the Supabase JWT** in middleware using `SUPABASE_JWT_SECRET` before serving protected routes (trips, profile, station reports).
- **App user data** lives in an application `user`/`profile` table keyed by the Supabase `auth.users.id` UUID — the app never stores raw passwords.
- Optional: enable **Row-Level Security (RLS)** so users can only read/write their own trips and reports.

## 🔐 Environment Management

Environment variables are handled per-app within the monorepo:

| Variable                    | Location       | Purpose                                                       |
| :-------------------------- | :------------- | :------------------------------------------------------------ |
| `DATABASE_URL`              | API            | Supabase Postgres connection string (session pooler / direct) |
| `SUPABASE_URL`              | API/Web/Mobile | Supabase project URL                                          |
| `SUPABASE_ANON_KEY`         | Web/Mobile     | Public anon key for client-side Supabase Auth                 |
| `SUPABASE_SERVICE_ROLE_KEY` | API            | Server-side privileged key (never exposed to clients)         |
| `SUPABASE_JWT_SECRET`       | API            | Secret used to verify Supabase-issued JWTs in API middleware  |
| `GOOGLE_MAPS_API_KEY`       | API/Web/Mobile | Access to Maps, Routes, Places & Elevation APIs               |
| `VITE_API_URL`              | Web            | Public URL of the deployed API (inlined at build time)        |

> Authentication is handled by **Supabase Auth**, so there is no self-managed `JWT_SECRET` for signing — the API only _verifies_ Supabase tokens using `SUPABASE_JWT_SECRET`.

### Secret Management

- **Never commit `.env` files** (they are gitignored). A single committed **`.env.example`** at the repo root is the template for all apps — copy it to a root `.env` and fill in. (The API loads it via dotenv; the web app via Vite `envDir`; Vite/Expo only expose `VITE_*`/`EXPO_PUBLIC_*` vars, so API secrets in the shared file never reach the client bundles.)
- All API configuration is centralized and documented in **`apps/api/src/config.ts`** (environment variables with safe defaults); never hardcode config or secrets elsewhere in the code.
- Use the **1Password CLI** or **GitHub Secrets** to share development secrets securely among the team, and inject production values via the Railway/Supabase dashboards.

## 🛠 Infrastructure Commands (Root)

Since we use Turborepo, use these commands from the root for global operations:

```bash
# Build all apps and packages
npm run build

# Lint the entire monorepo
npm run lint

# Clean all node_modules and build artifacts
npx turbo clean
```
