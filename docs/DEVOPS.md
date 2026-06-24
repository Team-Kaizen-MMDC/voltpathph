# DevOps & Deployment Guide 🚀🏗

![DevOps Version](https://img.shields.io/badge/devops-v1.0.0--alpha-blue)

This document outlines the deployment strategy, CI/CD workflows, and environment management for the VoltPH platform.

## 🏗 Deployment Strategy

### 1. Platform: Railway (Recommended)

We use **Railway** for seamless monorepo deployment of our Backend and Frontend Web services.

- **Config File:** `railway.json` in the root directory orchestrates the services.
- **Database:** Provision a **PostgreSQL** service within the same Railway project.
  - **Important:** Ensure the **PostGIS** extension is enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).
- **Services:**
  - **`voltph-api`**: Automatically uses `DATABASE_URL`. Requires `GOOGLE_MAPS_API_KEY`.
  - **`voltph-web`**: Requires `VITE_API_URL` pointing to the deployed API URL.

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
    - Link the PR to the corresponding issue card on the [VoltPathPH Project Board](https://github.com/orgs/Team-Kaizen-MMDC/projects/5).
    - Open a PR early for feedback if needed (Draft PR).
    - At least one approval is required before merging.
    - CI checks (Linting, Build) must pass.
    - Merge using "Squash and Merge" to keep history clean.

## 🔐 Environment Management

Environment variables are handled per-app within the monorepo:

| Variable              | Location       | Purpose                           |
| :-------------------- | :------------- | :-------------------------------- |
| `DATABASE_URL`        | API            | Connection string for PostGIS DB  |
| `JWT_SECRET`          | API            | Signing secret for authentication |
| `GOOGLE_MAPS_API_KEY` | API/Web/Mobile | Access to Maps & Routes APIs      |
| `VITE_API_URL`        | Web            | Public URL of the deployed API    |

### Secret Management

- **Never commit `.env` files.**
- Use the **1Password CLI** or **GitHub Secrets** to share development secrets securely among the team.

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
