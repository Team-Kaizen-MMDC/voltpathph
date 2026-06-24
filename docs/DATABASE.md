# Database Architecture & Schema Documentation 🗄🌍

This document provides a detailed breakdown of the VoltPH database schema, spatial indexing configurations, relationships, and coordinate reference standards.

---

## 🏗 Storage Engine & Extensions
- **Platform:** Supabase Managed PostgreSQL (v14+)
- **Extensions:**
  - `uuid-ossp`: For primary key generation using UUIDv4.
  - `postgis`: For native geospatial data types and queries.

---

## 🌐 Geospatial Standards & Coordinate System
- **Coordinate Reference System (CRS):** **SRID 4326** (WGS 84).
- **Data Type:** Geospatial columns use the `geography` type restricted to `Point` features.
  - *Rationale:* Using `geography` ensures that standard PostGIS operations like `ST_DWithin` and `ST_Distance` measure distances natively in **meters** on a spherical Earth, rather than Cartesian degrees.
- **Spatial Indexing:** A **GiST (Generalized Search Tree)** index is configured on all spatial columns to speed up radius lookups and routing buffers.

---

## 🗂 Tables & Columns Specifications

### 1. `user`
Stores account and authentication credentials.
- **Table Name:** `user`
- **Columns:**
  - `id` (UUIDv4, Primary Key, Default: `uuid_generate_v4()`)
  - `email` (VARCHAR(255), Unique, Not Null)
  - `password_hash` (VARCHAR(255), Not Null)
  - `name` (VARCHAR(255), Not Null)
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 2. `ev_model`
Specifications of EV vehicle models available in the Philippine market.
- **Table Name:** `ev_model`
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `make` (VARCHAR(100), Not Null) - e.g., "BYD", "Geely"
  - `model` (VARCHAR(100), Not Null) - e.g., "Atto 3"
  - `battery_capacity_kwh` (DOUBLE PRECISION, Not Null)
  - `average_consumption_kwh_per_km` (DOUBLE PRECISION, Not Null)
  - `plug_types` (TEXT[], Not Null) - e.g., `['Type 2', 'CCS2']`
  - `image_url` (VARCHAR(500), Nullable)
  - `drag_coefficient` (DOUBLE PRECISION, Default: `0.26`) - $C_d$
  - `frontal_area_sqm` (DOUBLE PRECISION, Default: `2.4`) - $A$
  - `mass_kg` (DOUBLE PRECISION, Default: `1600.0`) - $m$
  - `rolling_resistance_coefficient` (DOUBLE PRECISION, Default: `0.012`) - $C_r$
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 3. `user_vehicle`
Represents vehicles in a user's digital garage.
- **Table Name:** `user_vehicle`
- **Relationships:**
  - Foreign Key `userId` references `user(id)` ON DELETE CASCADE
  - Foreign Key `evModelId` references `ev_model(id)` ON DELETE RESTRICT
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `user_id` (UUIDv4, Not Null)
  - `ev_model_id` (UUIDv4, Not Null)
  - `nickname` (VARCHAR(100)) - e.g., "My Blue BYD"
  - `license_plate` (VARCHAR(20), Nullable)
  - `current_odometer_km` (DOUBLE PRECISION, Default: `0.0`)
  - `current_soc_percentage` (DOUBLE PRECISION, Default: `100.0`)
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 4. `trip`
Stores historical and saved optimized routes planned by users.
- **Table Name:** `trip`
- **Relationships:**
  - Foreign Key `userId` references `user(id)` ON DELETE CASCADE
  - Foreign Key `evModelId` references `ev_model(id)` ON DELETE RESTRICT
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `user_id` (UUIDv4, Not Null)
  - `ev_model_id` (UUIDv4, Not Null)
  - `origin_address` (VARCHAR(500), Not Null)
  - `origin_location` (GEOGRAPHY(Point, 4326), Not Null)
  - `destination_address` (VARCHAR(500), Not Null)
  - `destination_location` (GEOGRAPHY(Point, 4326), Not Null)
  - `total_distance_km` (DOUBLE PRECISION, Not Null)
  - `total_duration_min` (DOUBLE PRECISION, Not Null)
  - `initial_battery_percentage` (DOUBLE PRECISION, Not Null)
  - `final_predicted_battery_percentage` (DOUBLE PRECISION, Not Null)
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 5. `trip_waypoint`
Detailed road coordinates and SoC metrics along a planned trip route.
- **Table Name:** `trip_waypoint`
- **Relationships:**
  - Foreign Key `tripId` references `trip(id)` ON DELETE CASCADE
  - Foreign Key `recommendedStationId` references `charging_station(id)` ON DELETE SET NULL
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `trip_id` (UUIDv4, Not Null)
  - `sequence_number` (INTEGER, Not Null) - Order of coordinates
  - `name` (VARCHAR(250), Nullable)
  - `location` (GEOGRAPHY(Point, 4326), Not Null)
  - `distance_from_start_km` (DOUBLE PRECISION, Not Null)
  - `elevation_meters` (DOUBLE PRECISION, Not Null)
  - `predicted_soc_percentage` (DOUBLE PRECISION, Not Null)
  - `is_charging_stop` (BOOLEAN, Default: `FALSE`)
  - `recommended_station_id` (UUIDv4, Nullable)

### 6. `charging_station`
Geospatial directory of EV charging stations in the Philippines.
- **Table Name:** `charging_station`
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `name` (VARCHAR(255), Not Null) - e.g., "Shell Mamplasan Recharge"
  - `provider` (VARCHAR(150), Not Null) - e.g., "Shell Recharge", "UNIOIL"
  - `location` (GEOGRAPHY(Point, 4326), Not Null) [Index: GIST]
  - `is_available` (BOOLEAN, Default: `TRUE`)
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 7. `charger_connector`
Individual charger plug specifications linked to charging stations.
- **Table Name:** `charger_connector`
- **Relationships:**
  - Foreign Key `stationId` references `charging_station(id)` ON DELETE CASCADE
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `station_id` (UUIDv4, Not Null)
  - `plug_type` (VARCHAR(50), Not Null) - e.g., "CCS2", "Type 2"
  - `power_kw` (DOUBLE PRECISION, Not Null) - e.g., `50.0` for DC fast charging
  - `status` (VARCHAR(50), Default: `'Available'`) - e.g., `Available`, `Occupied`, `Broken`, `Offline`
  - `pricing_php_per_kwh` (DOUBLE PRECISION, Default: `0.0`)
  - `created_at` (TIMESTAMP, Default: `NOW()`)
  - `updated_at` (TIMESTAMP, Default: `NOW()`)

### 8. `station_report`
Crowdsourced status updates and reports submitted by users.
- **Table Name:** `station_report`
- **Relationships:**
  - Foreign Key `stationId` references `charging_station(id)` ON DELETE CASCADE
  - Foreign Key `userId` references `user(id)` ON DELETE SET NULL
- **Columns:**
  - `id` (UUIDv4, Primary Key)
  - `station_id` (UUIDv4, Not Null)
  - `user_id` (UUIDv4, Nullable)
  - `status_report` (VARCHAR(100), Not Null) - e.g., "Broken Plug", "Occupied"
  - `comments` (TEXT, Nullable)
  - `created_at` (TIMESTAMP, Default: `NOW()`)

---

## ⚡ Indexing Strategy
To optimize spatial queries and standard lookups:

1.  **GIST Index on `charging_station.location`:**
    ```sql
    CREATE INDEX idx_station_location ON charging_station USING GIST(location);
    ```
2.  **Foreign Key Indices:**
    Indexes are created on `user_vehicle.user_id`, `trip.user_id`, `trip_waypoint.trip_id`, and `charger_connector.station_id` to optimize table joins.
3.  **Unique Constraints:**
    A unique constraint is placed on `user.email` for security and identity lookup.
