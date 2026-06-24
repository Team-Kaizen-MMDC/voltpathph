---
name: voltph-devops
description: DevOps and CI/CD workflows for Voltpath PH, managing Turborepo, environments, and multi-platform deployments.
---

# Voltpath PH DevOps Skill

Managing the infrastructure and lifecycle of the Voltpath PH project.

## 🛠 Tech Stack

- **Monorepo:** Turborepo (note: `turbo.json` still uses the legacy `pipeline` key — Turbo v2 renamed it to `tasks`).
- **Package Manager:** NPM Workspaces
- **Deployment:** Railway (`railway.json` defines `voltph-api` + `voltph-web`).
- **Mobile:** Expo Application Services (EAS).

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

### 3. Environment Management

- API needs `DATABASE_URL`, `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`; web needs `VITE_API_URL` **at build time** (Vite inlines it — `serve` hosts static `dist`).
- Never commit `.env`; inject via Railway variables / GitHub Secrets.

### 4. Database host — resolve the conflict

- Docs disagree: System Design/ARCHITECTURE say **Supabase**; Implementation Plan/DEVOPS say a **Railway** Postgres. `railway.json` defines neither. Pick one, document it consistently, and (if Railway) add the DB service or note it's provisioned via the dashboard. Enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`.

### 5. Mobile Deployment

- EAS for builds + OTA updates (`eas build`, `eas update`).
