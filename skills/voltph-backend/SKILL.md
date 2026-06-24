---
name: voltph-backend
description: Specialized workflows for the Voltpath PH Node.js API, including Express, TypeORM, and PostGIS integration for EV calculations.
---

# Voltpath PH Backend Skill

Guidance for developing the Voltpath PH API, focusing on performance, geospatial logic, and robust data management.

## 🛠 Tech Stack

- **Runtime:** Node.js (LTS)
- **Framework:** Express.js + TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL with PostGIS

## 🚀 Key Workflows

### 1. Entity Management

- Entities live in `apps/api/src/entities/`.
- Always use `AppDataSource` for database operations.
- For geospatial data, use the `Point` type from `geojson` and the `geography` type in TypeORM.
- **Schema changes go through migrations, not `synchronize`.** `synchronize: true` is dev-only; set `false` and add migrations to `apps/api/src/migrations` (the `migrations` array is currently empty).

### 2. Geospatial Queries

- Use the QueryBuilder for complex spatial operations.
- **Always use SRID `4326`** (WGS 84). Example: `ST_DWithin(location, ST_SetSRID(ST_Point(lng, lat), 4326), radius)`. Never use `4324` (a past bug — verify with `grep -rn 4324`).

### 3. Trip Optimization Logic

- Coordinate with the Google Routes/Elevation APIs to retrieve route + terrain data (the `@googlemaps/google-maps-services-js` SDK is installed but currently unused — `/api/trips/optimize` is a stub returning mock data).
- Apply the **rule-based** energy model from `packages/shared` (see `voltph-ev-physics`) using the selected `EVModel` specs.

### 4. Request Hardening (apply to every route)

- **Validate input** with the shared zod schemas (`packages/shared/src/validation.ts`, e.g. `TripPlanSchema`) before using `req.body` — do not cast `req.body as TripPlan` blindly.
- **Never return raw error objects** (`res.json({ error })`) — they leak stack traces/DB internals. Return a safe message + log server-side via a central error handler.
- Restrict CORS to known origins in production; add `helmet`, rate limiting, and a JSON body-size limit (see `voltph-security`).
- Make `/health` report DB readiness, not just `ok`.
