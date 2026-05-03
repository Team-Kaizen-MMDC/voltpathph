---
name: voltph-database
description: Management and optimization of the VoltPH PostgreSQL/PostGIS database, focusing on geospatial indexing and EV data schemas.
---

# VoltPH Database Skill

Best practices for managing the VoltPH data layer.

## 🛠 Tech Stack
- **Database:** PostgreSQL (v14+)
- **Extensions:** PostGIS
- **Hosting:** Local Docker (dev), Managed DB (prod)

## 🚀 Key Workflows

### 1. Schema Management
- All schema changes should be reflected in the TypeORM entities.
- Ensure spatial indexes are created on `location` columns for `ChargingStation`.

### 2. PostGIS Operations
- Use `SRID 4324` (WGS 84) for all geospatial points.
- Prefer `geography` over `geometry` for distance calculations to ensure accuracy on the earth's surface.

### 3. Data Integrity
- Maintain a strictly typed link between `TripPlan` results and the `EVModel` specs used for calculations.
