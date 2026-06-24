# Changelog 📝

All notable changes to the **Voltpath PH** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
