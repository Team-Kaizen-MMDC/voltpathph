---
name: voltph-maps-gis
description: Specialized workflows for GIS and mapping integration, including Google Maps Routes/Places/Elevation API calls, PostGIS spatial indexing, and polyline operations.
---

# Voltpath PH Maps & GIS Skill

Guidance for handling geospatial operations, Google Maps API integration, and PostGIS query optimizations for the Voltpath PH platform.

## 🌍 Spatial Foundations (PostGIS)

- **Coordinate Reference System:** Always use **SRID 4326** (WGS 84 GPS standard) for geospatial tables.
- **Verify before claiming a fix:** run `grep -rn 4324` across `apps/`, `packages/`, and `skills/` and confirm zero hits before stating the SRID is correct anywhere (code, docs, or CHANGELOG). A past CHANGELOG entry claimed the `4324→4326` fix while the code still used `4324` — don't repeat that.
- **Geography vs. Geometry:**
  - Use `geography` in TypeORM columns for measurements in meters (e.g., `ST_DWithin` with radius in meters).
  - Use `geometry` for flat spatial math/indexing, but cast to `geography` for exact spherical distances.
- **Spatial Indexing:** Ensure a **GiST** index on all spatial columns (e.g., `@Index({ spatial: true })`).

## 🗺 Google Maps Platform Integrations

- **Routes API:** detailed routes (step polylines, duration, traffic speeds, distances).
- **Places API:** origin/destination autocomplete on web and mobile.
- **Elevation API:** elevation along the decoded polyline to compute slope/grades for the energy weights.

## 🚀 Key Algorithms & Queries

### 1. Polyline Decoding

- Route paths are encoded with the Encoded Polyline Algorithm. Decode to `[lat, lng]` arrays in the backend.

### 2. Searching Along a Route (Spatial Buffer Query)

- To find charging stations near the planned route:
  1. Convert the decoded polyline into a PostGIS `LineString`.
  2. Buffer the line (e.g., 5 km) via `ST_Buffer`, or use `ST_DWithin` against the path.
  3. Query `ChargingStation` points within the buffer.
  - _Example:_
    ```sql
    SELECT * FROM charging_station
    WHERE ST_DWithin(location::geography, ST_GeogFromText(:route_line), :buffer_meters);
    ```

### 3. Polyline Reduction

- For long routes, reduce coordinates sent to the Elevation API using Ramer-Douglas-Peucker to save quota and cost.
