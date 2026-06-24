---
name: voltph-database
description: Management and optimization of the Voltpath PH PostgreSQL/PostGIS database, focusing on geospatial indexing and EV data schemas.
---

# Voltpath PH Database Skill

Best practices for managing the Voltpath PH data layer.

## 🛠 Tech Stack

- **Database:** PostgreSQL (v14+)
- **Extensions:** PostGIS (and `uuid-ossp` for UUID PKs)
- **Hosting:** Local Docker (dev); managed cloud (prod). **Note:** the docs disagree on the prod host (Supabase vs Railway Postgres) — confirm the canonical choice before documenting (see `voltph-devops`).

## 🚀 Key Workflows

### 1. Schema Management

- All schema changes are reflected in the TypeORM entities **and** an explicit migration.
- **`synchronize: true` is dev-only.** In prod use `synchronize: false` + migrations so the live schema is deterministic and reviewable.
- Keep entities and `docs/DATABASE.md` in sync. Today only `EVModel` and `ChargingStation` are implemented; the 8-table schema in `DATABASE.md` (user, user_vehicle, trip, trip_waypoint, charger_connector, station_report) is documented but not yet built — mark such tables "Planned" until they exist.
- Ensure spatial indexes (GiST) exist on `location` columns for `ChargingStation`.

### 2. PostGIS Operations

- **Use `SRID 4326` (WGS 84) for all geospatial points.** `4326` is the GPS standard; `4324` is **not** WGS 84 and was a past bug — verify with `grep -rn 4324` before claiming a schema is correct.
- Prefer `geography` over `geometry` for distance calculations to measure meters accurately on the earth's surface.

### 3. Data Integrity

- Maintain a strictly typed link between `TripResult` outputs and the `EVModel` specs used for calculations.
- Document units explicitly: `battery_capacity_kwh` (kWh) and `average_consumption_kwh_per_km` (kWh/km) vs. the paper's Wh/km.
