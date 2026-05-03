---
name: voltph-backend
description: Specialized workflows for the VoltPH Node.js API, including Express, TypeORM, and PostGIS integration for EV calculations.
---

# VoltPH Backend Skill

Guidance for developing the VoltPH API, focusing on performance, geospatial logic, and robust data management.

## 🛠 Tech Stack
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js + TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL with PostGIS

## 🚀 Key Workflows

### 1. Entity Management
- Entities are located in `apps/api/src/entities/`.
- Always use `AppDataSource` for database operations.
- For geospatial data, use the `Point` type from `geojson` and `geography` type in TypeORM.

### 2. Geospatial Queries
- Use the QueryBuilder for complex spatial operations.
- Example: `ST_DWithin(location, ST_SetSRID(ST_Point(lng, lat), 4324), radius)`.

### 3. Trip Optimization Logic
- Coordinate with the Google Routes API to retrieve route data.
- Apply EV-specific consumption formulas based on the `EVModel` specs.
