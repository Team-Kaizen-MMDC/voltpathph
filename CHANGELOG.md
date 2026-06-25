# Changelog 📝

All notable changes to the **Voltpath PH** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed

- **Applied the SRID `4324` → `4326` correction in code.** The `[1.0.0-beta]` entry below stated this correction was made, but `apps/api/src/entities/ChargingStation.ts` and `apps/api/src/routes/stations.ts` still used the invalid `4324`. The WGS-84 (`4326`) values are now actually committed, so radius-based PostGIS `ST_DWithin` queries resolve correctly.
- Corrected the lingering `SRID 4324` references in the `voltph-backend`, `voltph-database`, and `voltph-data-engineer` agent skills (the `voltph-database` skill also mislabeled `4324` as "WGS 84"); all now specify `4326`.

### Changed

- Realigned the `voltph-ev-physics` skill and related guidance to treat the paper's rule-based multiplicative energy model (`E = Ebase × Wtraffic × Welevation × Wtemperature`) as canonical, with the force-based physics model retained as labeled future work.
- Hardened security, testing, DevOps, and documentation skills with concrete checklists (input validation, no raw error leakage, migrations over `synchronize`, CI workflow template, doc/code consistency mandate).
- Implemented a real `/api/trips/optimize`: zod validation, Google Directions/Elevation routing (haversine fallback), the rule-based energy model, per-segment SoC, and a PostGIS nearby-station query — replacing the hard-coded mock.
- Made the data source production-safe: env-gated `synchronize` (off in production), TypeORM migrations, and a Supabase Postgres connection story; added a central error handler, JSON body limit, and env-driven CORS allowlist.
- Standardized the database/auth host on **Supabase** (DB + PostGIS + Supabase Auth) across the paper, docs, and skills; removed deferred physics columns from the documented schema.
- Aligned the Capstone paper to the MVP scope: FR-03 (route ranking) and FR-10 (crowdsourcing) marked **Phase 2**; objectives, research questions, system goals, scope, testing, and conclusion reconciled; regression specified as **log-linear**.
- Updated `README.md`, `docs/TESTING.md`, and `docs/TECH_STACK.md` to match the implemented stack and tests.

### Added

- `docs/REVIEW_AND_IMPROVEMENTS.md` — advisory review of the codebase, documentation, and Capstone paper.
- `voltph-capstone-paper` agent skill for maintaining the academic paper (APA, table/figure numbering, FR/NFR cross-reference integrity, proposal tense).
- Rule-based energy model in `packages/shared/src/energy.ts` (Tier 1 multiplicative + Tier 2 per-segment with signed elevation and time-based AC) with 18 Vitest unit tests (`energy.test.ts`).
- `apps/api/src/services/maps.ts` (Google Directions + Elevation, per-segment breakdown) and `services/weather.ts` (Open-Meteo ambient temperature).
- `apps/api/src/middleware/auth.ts` — Supabase JWT verification (HS256 via Node `crypto`, no new dependency).
- TypeORM initial migration (`apps/api/src/migrations/`) and `migration:run/revert/generate` scripts.
- GitHub Actions CI (`.github/workflows/ci.yml`): install → build → lint → test.
- Geely EX5 Em-i Max (the calibration vehicle) added to the EV seed.
- `docs/ENERGY_MODEL.md`, `docs/MVP_SCOPE_AND_FEASIBILITY.md`, and `docs/PAPER_MVP_ALIGNMENT.md`.
- Centralized, documented API configuration in `apps/api/src/config.ts`, and a single committed **root `.env.example`** consolidating every app's variables (the API loads the root `.env` via dotenv; the web app via Vite `envDir`). Externalized all previously-hardcoded tunables (API timeouts, elevation-point cap, station search radius/limit, low-SoC threshold, routing detour/speed, Open-Meteo URL) to documented environment variables; `process.env` is now read in exactly one place.

---

## [1.0.0-beta] - 2026-06-24

This release marks the transition of the Voltpath PH platform from initial code skeleton scaffolding (alpha) to a complete project specification, data model design, and testing configuration milestone (beta).

### Added

- Created a comprehensive 12-week, 6-sprint backlog and roadmap detailing developer roles and estimation targets ([backlog_and_sprint_plan.md](file:///Users/brianjancarlos/.gemini/antigravity-cli/brain/9fb993ec-2a95-495d-9a95-8df92cc36a97/backlog_and_sprint_plan.md)).
- Registered **34 detailed agile user stories/feature issues** on the GitHub Project Kanban board, fully configured with description templates, technical requirements, story points, sizing, and acceptance criteria lists.
- Added comprehensive database architecture documentation ([docs/DATABASE.md](./docs/DATABASE.md)) detailing column specs, constraints, foreign keys, and indexes for 8 new relational tables (users, user vehicles/garage, trip waypoints, connectors, and report queues).
- Added quality assurance documentation ([docs/TESTING.md](./docs/TESTING.md)) specifying Jest/Vitest boundaries, backend integration endpoint testing parameters, Geely EX5 Em-i Max road validation metrics (MAPE $\le 15\%$, RMSE $\le 80$ Wh/km), and User Acceptance Testing (SUS scoring).
- Added custom agent skills inside the `skills/` folder to guide multi-agent subtask execution:
  - `voltph-mobile-developer`: Guides Expo, React Native navigation, offline caches, and EAS updates.
  - `voltph-maps-gis`: Guides Google Maps SDK, polylines processing, and spatial queries.
  - `voltph-ev-physics`: Guides consumption math equations (drag, rolling resistance, grades, and tropical A/C draw).
  - `voltph-product-owner`: Establishes sprint boundaries and DoD (Definition of Done) checklists.
- Added Mermaid sequence flow diagrams mapping coordinates processing, elevation data fetching, and spatial queries directly inside backend controllers ([docs/BACKEND.md](./docs/BACKEND.md)).
- Added Mermaid Entity Relationship Diagram (ERD) mapping the new relational schema in [docs/DATABASE.md](./docs/DATABASE.md).

### Changed

- Standardized project branding name to **Voltpath PH** (updating legacy references of `VoltPH` and `VoltPath` in 29 documentation and skill files).
- Updated local git remote URLs and documentation clone commands to target the new repository address: `https://github.com/Team-Kaizen-MMDC/voltpathph.git`.
- Corrected the legacy coordinate standard `SRID 4324` in backend routes and entities to the standard GPS coordinate reference system **`SRID 4326`** using spatial `geography(Point)` typings.

---

## [1.0.0-alpha] - 2026-06-10

### Added

- Initial project structure scaffolded using Turborepo.
- Backend API shell (Node.js Express) containing baseline routes and TypeORM entity scaffolds.
- Frontend web app layout in React Vite with mocked trip forms.
- Frontend mobile app shell in React Native Expo containing placeholder layouts.
- Shared logic npm package structure.
- Initial development documentation files.
