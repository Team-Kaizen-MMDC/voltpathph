# 1. Database & Authentication Platform — Supabase (Postgres + PostGIS) + Railway

- **Status:** Accepted
- **Date:** 2026-06-25
- **Deciders:** Team Kaizen (Section A3101)

## Context

Voltpath PH predicts EV State-of-Charge and surfaces charging stations along Philippine routes. Its core data operations are **geospatial-relational**:

- Radius and along-route charging-station lookups via PostGIS (`ST_DWithin`, route buffers) on `geography` columns with GiST indexes.
- Relational joins across EV models, trips, trip waypoints, and stations.
- SQL aggregation for the research deliverable (MAPE/RMSE validation and regression on test-drive data).

It also needs JWT authentication and a **server-side compute layer** for the rule-based energy model and Google Maps orchestration.

Constraints: a 3-person team, a sub-12-week MVP, cost sensitivity (free tiers), and an academically defensible architecture. We evaluated **Firebase** as an alternative to the current **Supabase + Railway** stack.

## Decision

Use **Supabase** (managed PostgreSQL 15 + PostGIS + Supabase Auth) for data, geospatial, and authentication, and **Railway** for the Node/Express API compute. **Do not adopt Firebase.**

## Rationale

1. **PostGIS is essential and non-substitutable.** Radius/along-route station search is a headline feature. Firestore has no spatial engine — it requires geohash workarounds (geofirestore) and cannot express route-buffer queries. Adopting Firebase means abandoning the project's most defensible technical capability.
2. **The model is relational and already built** with TypeORM. Firestore is schemaless NoSQL; switching would mean rewriting the data layer and the trip/SoC join logic late in the timeline.
3. **SQL serves the research half** (MAPE/RMSE, regression) far better than document NoSQL.
4. **Auth parity.** Both Supabase Auth and Firebase Auth are excellent; Supabase Auth integrates with the same database (Row-Level Security keyed to `auth.uid()`) and is already wired into the API and mobile app.
5. **Compute fit.** The energy model + Maps orchestration is a stateful-friendly Express service that suits a Railway container. Firebase Cloud Functions would require a refactor to functions and incur cold starts.
6. **Migration cost.** Switching now is a late, high-risk rewrite (DB layer, auth, possibly compute) that sacrifices the strongest feature for no commensurate gain.

## Consequences

**Positive**

- Native spatial queries; one platform for DB + Auth (single dashboard, RLS).
- No rewrite; existing TypeORM entities, energy model, and auth stay.
- SQL available for analytics/validation.
- Frictionless local dev: Docker/Podman Postgres + PostGIS, no cloud account required (see `docs/DEVOPS.md`).
- Standard Postgres ⇒ portable to any Postgres host (Neon, Railway PG, RDS) if needed — limited lock-in.

**Trade-offs**

- Weaker real-time/offline than Firestore. Acceptable: real-time isn't core; crowdsourced live charger availability is Phase 2 and Supabase Realtime is sufficient.
- Supabase is younger than Firebase, but it is open-source and Postgres-based, which de-risks portability.

## Alternatives considered

- **Firebase (Firestore + Auth + Functions)** — rejected: NoSQL/no-PostGIS mismatch with the geospatial-relational core; late, high-risk rewrite.
- **Firebase Auth + Postgres (hybrid)** — rejected: two vendors, loses Auth↔DB (RLS) integration, and would require redoing working auth for a marginal mobile-UX gain.
- **Railway-managed Postgres instead of Supabase** — viable, but Supabase bundles Auth + PostGIS + dashboard for fewer moving parts; preferred for a small team.

## References

- `docs/MVP_SCOPE_AND_FEASIBILITY.md` (Google Maps API capability analysis)
- `docs/ARCHITECTURE.md`, `docs/ENERGY_MODEL.md`, `docs/DATABASE.md`
