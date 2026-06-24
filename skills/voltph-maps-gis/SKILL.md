---
name: voltph-maps-gis
description: Specialized workflows for GIS and mapping integration, including Google Maps Routes/Places/Elevation API calls, PostGIS spatial indexing, and polyline operations.
---

# VoltPH Maps & GIS Skill

Guidance for handling geospatial operations, Google Maps API integration, and PostGIS query optimizations for the VoltPH platform.

## 🌍 Spatial Foundations (PostGIS)
- **Coordinate Reference System:** Always use **SRID 4326** (WGS 84 GPS standard) for geospatial tables. (Note: Fix any occurrences of legacy SRID 4324).
- **Geography vs. Geometry:** 
  - Use `geography` type in TypeORM columns for measurements in meters (e.g., `ST_DWithin` with radius in meters).
  - Use `geometry` type for flat spatial math or indexing, but cast to `geography` when calculating exact spherical distances.
- **Spatial Indexing:** Ensure a **GiST** index is created on all spatial columns (e.g., `@Index({ spatial: true })`).

## 🗺 Google Maps Platform Integrations
- **Routes API:** Retrieve detailed routes (including step-by-step polylines, duration, traffic speeds, and distances).
- **Places API:** Provide search autocomplete for origin/destination search fields on both web and mobile.
- **Elevation API:** Query elevation data along the decoded polyline points to compute changes in potential energy (slope/grades) for battery calculation.

## 🚀 Key Algorithms & Queries

### 1. Polyline Decoding
- Route paths from Google Routes are encoded using the Encoded Polyline Algorithm. Decode this into an array of `[lat, lng]` coordinates in the backend.

### 2. Searching Along a Route (Spatial Buffer Query)
- To find charging stations near the planned route:
  1. Convert the decoded polyline into a PostGIS `LineString` object.
  2. Create a buffer around the line (e.g., 5 kilometers) using `ST_Buffer` (or use `ST_DWithin` on the path).
  3. Query `ChargingStation` points that intersect this buffer.
  - *Example query outline:*
    ```sql
    SELECT * FROM charging_station 
    WHERE ST_DWithin(location::geography, ST_GeogFromText(:route_line), :buffer_meters);
    ```

### 3. Polyline Reduction
- For long routes, reduce the number of coordinates sent to the Elevation API using the Ramer-Douglas-Peucker algorithm to save API quota and cost.
