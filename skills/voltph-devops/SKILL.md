---
name: voltph-devops
description: DevOps and CI/CD workflows for Voltpath PH, managing Turborepo, environments, and multi-platform deployments.
---

# Voltpath PH DevOps Skill

Managing the infrastructure and lifecycle of the Voltpath PH project.

## 🛠 Canonical Platforms

- **Compute:** Railway (`railway.json` defines `voltph-api` + `voltph-web`).
- **Data + Auth + Storage:** **Supabase** (PostgreSQL 15 + PostGIS + Supabase Auth). The DB is **not** in `railway.json`.
- **Mobile:** Expo Application Services (EAS).
- **Monorepo:** Turborepo (note: `turbo.json` still uses the legacy `pipeline` key — Turbo v2 renamed it to `tasks`).
- **Package Manager:** NPM Workspaces.

## 🚀 Key Workflows

### 1. Monorepo Commands

- `npm run build` (root) builds all packages; `turbo dev` for local dev.
- Pin Node (`engines` field / `.nvmrc`) so NIXPACKS uses the same major the docs assume (18+).

### 2. CI/CD — make "CI must pass" real

- **There is no CI yet** (`.github/` has only `CODEOWNERS`), yet `GEMINI.md`, `DEVOPS.md`, and the paper all say CI gates PRs. Add `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: { pull_request: { branches: [main] }, push: { branches: [main] } }
  jobs:
    verify:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 20, cache: npm }
        - run: npm ci
        - run: npm run build
        - run: npm run lint
        - run: npm run test
  ```
- Then enable branch protection on `main` requiring this check + 1 approval (matches the documented GitHub Flow).

### 3. Database & Auth (decided: Supabase)

- The Supabase-vs-Railway-Postgres conflict is **resolved in favor of Supabase**. State Supabase consistently in all docs/paper; the DB lives in the Supabase project, not `railway.json`.
- Enable PostGIS once: `CREATE EXTENSION IF NOT EXISTS postgis;` (Supabase SQL editor).
- **Connect from the API via the session pooler (port 5432) or the direct connection** — not the transaction pooler (6543), which TypeORM's prepared statements don't support.
- **Auth = Supabase Auth.** The API verifies Supabase JWTs (`SUPABASE_JWT_SECRET`); it does not sign its own tokens (no self-managed `JWT_SECRET`). See `voltph-security`.

### 4. Environment Management

- API needs `DATABASE_URL` (Supabase), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `GOOGLE_MAPS_API_KEY`.
- Clients need `SUPABASE_URL` + `SUPABASE_ANON_KEY`; web also needs `VITE_API_URL` **at build time** (Vite inlines it; `serve` hosts static `dist`).
- Never commit `.env`; inject via Railway variables / GitHub Secrets.

### 5. Web hosting (optional upgrade)

- Railway-static (`serve`) works, but hosting the SPA on Vercel/Netlify/Cloudflare Pages gives a CDN + per-PR preview URLs and frees Railway for the API only.

### 6. Mobile Deployment

- EAS for builds + OTA updates (`eas build`, `eas update`).
