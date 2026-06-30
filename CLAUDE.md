# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Voltpath PH — an EV trip-planning / State-of-Charge (SoC) prediction platform for the Philippines. Turborepo + npm workspaces monorepo: an Express/TypeORM API, a React (Vite) web app, a React Native (Expo) mobile app, and a shared TypeScript package that holds the energy model and validation schemas.

## Commands

Run from the repo root; Turbo fans out to workspaces. Node 18+, `npm@10.2.4`.

| Task                       | Command                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Install                    | `npm install`                                                                                                            |
| Dev (all apps)             | `npm run dev`                                                                                                            |
| Build all                  | `npm run build`                                                                                                          |
| Test all                   | `npm test`                                                                                                               |
| Typecheck all              | `npm run typecheck`                                                                                                      |
| Lint all                   | `npm run lint`                                                                                                           |
| Format                     | `npm run format`                                                                                                         |
| Local DB up / down / reset | `npm run db:up` · `npm run db:down` · `npm run db:reset` (Docker **or** Podman, auto-detected via `scripts/compose.mjs`) |

**Per-workspace work** — scope with Turbo filters or `cd`:

- `npm test -- --filter=@voltph/shared` (the energy model)
- `cd apps/api && npm test` → Jest · `cd apps/web && npm test` → Vitest · `cd packages/shared && npm test` → Vitest
- Single test file: `cd apps/api && npx jest src/path/to.test.ts` · `cd packages/shared && npx vitest run src/energy.test.ts`
- API DB migrations (run from `apps/api`): `npm run migration:generate` · `npm run migration:run` · `npm run migration:revert`
- Seed reference data: `cd apps/api && npm run seed`

> `turbo test` has `dependsOn: ["^build"]`, so `@voltph/shared` is built before dependents' tests run. If shared changes don't show up in API/web tests, rebuild shared.

## Architecture — the big picture

### `@voltph/shared` is the hub

`packages/shared/src/` exports the domain interfaces (`EVModel`, `ChargingStation`, `TripPlan`, `TripResult`), the Zod `TripPlanSchema`, and the **energy model** (`energy.ts`). Both the API and web import from `@voltph/shared`. Change a shared type and you change every consumer — and shared must rebuild before their tests pass.

### The energy model is the deterministic scientific core

`packages/shared/src/energy.ts` is a rule-based, explainable model: `E = Ebase × Wtraffic × Welevation × Wtemperature`, with two tiers — `estimateTripEnergy` (quick multiplicative) and `estimateRouteEnergy` (full: signed elevation potential energy + regen, time-based auxiliary/AC load). Calibrated to a reference vehicle (Geely EX5 Em-i Max). It is unit-tested (`energy.test.ts`) and tracked against MAPE/RMSE targets. **Treat it as audited, deterministic code**: propose diffs with rationale, keep it explainable, and never make it nondeterministic or rewrite it casually. Spec: `docs/ENERGY_MODEL.md`.

### Trip-optimize is the orchestration spine

`POST /api/trips/optimize` (`apps/api/src/routes/trips.ts`) is the flow that ties everything together: validate body with `TripPlanSchema` → load the `EVModel` → `getRouteData()` (maps service) → `estimateRouteEnergy()` → if predicted arrival SoC `< config.trip.lowSocThresholdPercent`, find nearby stations. Other routes: `stations/nearby`, `places/search`, `evModels`.

### Graceful degradation is the defining pattern — local dev needs no secrets

The system is designed to run end-to-end with zero external credentials, falling back at every external boundary:

- **No `GOOGLE_MAPS_API_KEY`** → maps service uses a haversine + detour-factor distance/duration estimate instead of the Routes/Elevation APIs.
- **No `SUPABASE_JWT_SECRET`** (and not production) → `requireAuth` lets requests through (dev bypass). In production a missing secret is a hard 500; a missing/invalid token is always 401.
- **Empty/unavailable charging-station table** → `findStationsNearby` returns `[]` rather than throwing.
  When adding an external dependency, preserve this: provide a sensible local fallback.

### Configuration discipline

`apps/api/src/config.ts` is the **single** source of config and the **only** place that reads `process.env` or loads dotenv (it loads the monorepo-root `.env`). Add new tunables/secrets as fields there with documented defaults — do not scatter `process.env` reads or hardcode values elsewhere.

### Auth is hand-rolled, verify-only

`apps/api/src/middleware/auth.ts` verifies Supabase-issued HS256 JWTs manually (HMAC + `timingSafeEqual`), with no JWT library. It only _verifies_ tokens — Supabase issues them. Keep the dev-bypass / production-strict behavior intact when touching it.

### Database: TypeORM + PostGIS

`apps/api/src/data-source.ts`: prefers a full `DATABASE_URL`, else discrete `DB_*` vars (a URL still containing a `<` placeholder is ignored). `synchronize` is **on in dev, off in production** — production schema changes go through migrations (`apps/api/src/migrations/`). Charging stations use a PostGIS `geography` column (`location`); spatial queries are raw SQL via the query builder (`ST_DWithin`, `ST_X`/`ST_Y`). See `docs/DATABASE.md`.

## Environment

One consolidated **root `.env`** (copy from the root `.env.example`) serves all apps. The API reads it via `config.ts` (resolves three levels up from `__dirname`, works under ts-node and compiled `dist`); the web app reads its `VITE_*` vars via Vite's `envDir`. Tests skip dotenv (`NODE_ENV=test`) and set env explicitly, so suites stay hermetic.

## Deployment

Railway hosts the API/web compute (`railway.json`); Supabase provides PostgreSQL + PostGIS + Auth. See `docs/DEVOPS.md`.

## Further docs

`docs/ARCHITECTURE.md` (system diagram), `BACKEND.md`, `DATABASE.md`, `ENERGY_MODEL.md`, `TESTING.md`, `FRONTEND_WEB.md`, `FRONTEND_MOBILE.md`, `DEVOPS.md`. Also `docs/AGENT_LOOPS.md` for using Claude Code / the Agent SDK on this repo.
