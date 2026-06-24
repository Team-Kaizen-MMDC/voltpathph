---
name: voltph-devops
description: DevOps and CI/CD workflows for Voltpath PH, managing Turborepo, environments, and multi-platform deployments.
---

# Voltpath PH DevOps Skill

Managing the infrastructure and lifecycle of the Voltpath PH project.

## 🛠 Tech Stack
- **Monorepo:** Turborepo
- **Package Manager:** NPM Workspaces
- **Tools:** GitHub Actions, Docker, Prettier/ESLint

## 🚀 Key Workflows

### 1. Monorepo Commands
- Run `npm run build` from the root to build all packages.
- Use `turbo dev` for localized development of specific apps.

### 2. Environment Management
- Maintain `.env` files in `apps/api`, `apps/web`, and `apps/mobile`.
- Ensure `GOOGLE_MAPS_API_KEY` is present in all frontend environments.

### 3. Deployment
- **Web/API:** Target Vercel or Render.
- **Mobile:** Use Expo Application Services (EAS) for builds and OTA updates.
