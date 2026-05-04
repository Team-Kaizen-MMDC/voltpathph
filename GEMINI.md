# VoltPH Project Instructions

This file contains mandates and conventions for the VoltPH project. These instructions take precedence over general defaults.

## 🌳 Branching Strategy (GitHub Flow)

All contributors MUST follow the GitHub Flow strategy:

1.  **Branch Naming:**
    -   `feat/` for new features (e.g., `feat/auth-integration`)
    -   `fix/` for bug fixes (e.g., `fix/api-timeout`)
    -   `docs/` for documentation updates (e.g., `docs/api-guide`)
    -   `chore/` for maintenance (e.g., `chore/dependency-update`)
2.  **Workflow:**
    -   Never commit directly to `main`.
    -   Create a branch from `main`.
    -   Submit a Pull Request (PR) for review.
    -   Wait for CI checks (linting) to pass.
    -   Merge into `main` after approval.

## 🏗 Architectural Conventions

-   **Shared Logic:** Business rules and DTOs MUST be placed in `packages/shared`.
-   **Type Safety:** Use strict TypeScript. Always use definite assignment assertions (`!`) for TypeORM entity properties.
-   **Backend:** Node.js Express with TypeORM and PostGIS.
-   **Frontend:** React (Vite) for Web, React Native (Expo) for Mobile.

## 🛠 Tooling & Libraries

- **Monorepo:** Turborepo. Use `npm run dev` from root to start all services.
- **Linting & Formatting:** `eslint` and `prettier`. Automatically enforced on commit via `husky` and `lint-staged`.
- **Validation:** `zod`. Use for all shared schemas in `packages/shared`.
- **Data Fetching:** `@tanstack/react-query` and `axios` on the frontend for robust state and networking.
- **Backend SDKs:** `@googlemaps/google-maps-services-js` for official Maps integration.
- **Database:** PostgreSQL with PostGIS extension. Run `cd apps/api && npm run seed` for initial data.

