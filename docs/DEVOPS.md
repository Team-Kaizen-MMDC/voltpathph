# DevOps & Deployment Guide 🚀🏗

![DevOps Version](https://img.shields.io/badge/devops-v1.0.0--alpha-blue)

This document outlines the deployment strategy, CI/CD workflows, and environment management for the VoltPH platform.

## 🏗 Deployment Strategy

### 1. Backend API (`apps/api`)
- **Target Platform:** Render, AWS App Runner, or Railway.
- **Database:** Managed PostgreSQL with PostGIS (e.g., Aiven, Supabase, or AWS RDS).
- **Deployment Flow:**
  - Connect GitHub repository to the hosting provider.
  - **Build Command:** `npm install && npm run build --filter=api`
  - **Start Command:** `npm run start --filter=api`
  - **Environment Variables:** Ensure all variables in `apps/api/.env.example` are configured in the provider's dashboard.

### 2. Frontend Web (`apps/web`)
- **Target Platform:** Vercel or Netlify.
- **Deployment Flow:**
  - Connect GitHub repository.
  - **Build Command:** `npm run build --filter=web`
  - **Output Directory:** `apps/web/dist`
  - **Environment Variables:** Set `VITE_API_URL` to point to your deployed API.

### 3. Frontend Mobile (`apps/mobile`)
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
We use GitHub Actions for automated linting and testing. (Found in `.github/workflows/`)

- **Linting:** Triggered on every Push/PR.
- **Testing:** Triggered on every PR to `main`.
- **Production Deploy:** (Optional) Triggered when a tag is pushed or a PR is merged to `main`.

## 🔐 Environment Management
Environment variables are handled per-app within the monorepo:

| Variable | Location | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | API | Connection string for PostGIS DB |
| `JWT_SECRET` | API | Signing secret for authentication |
| `GOOGLE_MAPS_API_KEY` | API/Web/Mobile | Access to Maps & Routes APIs |
| `VITE_API_URL` | Web | Public URL of the deployed API |

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
