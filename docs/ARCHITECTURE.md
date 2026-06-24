# System Architecture 🏛

![Architecture Version](https://img.shields.io/badge/arch-v1.0.0-blue)

This document describes the high-level architecture of the Voltpath PH platform.

## Architecture Diagram

```mermaid
graph TB
    subgraph Clients ["Client Layer (TypeScript)"]
        Web["Web Admin App<br/>(React / Vite)"]
        Mobile["Mobile Driver App<br/>(React Native / Expo)"]
    end

    subgraph Packages ["Shared Codebase"]
        Shared["@voltph/shared<br/>(Zod Schemas, Energy Model, Interfaces)"]
    end

    subgraph Infrastructure ["Orchestration & Logic (Railway)"]
        API["Voltpath PH API Gateway<br/>(Node.js / Express)"]
        Cache["In-Memory Cache<br/>(Routes & Stations Cache)"]
    end

    subgraph Data ["Data Storage Tier (Supabase)"]
        DB[(PostgreSQL + PostGIS)]
        SpatialIndex[GIST Spatial Indexing]
    end

    subgraph Cloud ["External Cloud Services"]
        G_Routes["Google Routes API<br/>(Traffic-Aware Polyline)"]
        G_Elevation["Google Elevation API<br/>(Terrain Profiles)"]
        G_Places["Google Places API<br/>(Station Locs & Autocomplete)"]
    end

    %% Client associations
    Web -.-> Shared
    Mobile -.-> Shared
    API -.-> Shared

    %% Communications
    Web -->|REST APIs / JWT| API
    Mobile -->|REST APIs / JWT / Geolocation| API

    %% API Interactions
    API <--> Cache
    API -->|Google Maps SDK| G_Routes
    API -->|Google Maps SDK| G_Elevation
    API -->|Google Maps SDK| G_Places

    %% Data Interactions
    API <-->|TypeORM / SQL / Spatial Query| DB
    DB -.-> SpatialIndex
```

## Component Breakdown

### 1. Client Applications

- **Web App:** A Vite-powered React application for administrators and managers.
- **Mobile App:** An Expo-powered React Native application for drivers, integrating geolocation APIs, native maps, and offline syncing.
- Both apps share validation schemas and interfaces via the shared package.

### 2. Backend API

- **Technology:** Node.js Express with TypeScript and TypeORM.
- **Orchestration:** Coordinates Google Maps Services (Routes, Elevation, Places) with database spatial searches to predict segment consumption and find stations.
- **Authentication:** Verifies **Supabase Auth** JWTs in middleware on protected routes; the API itself does not issue or store credentials.
- **Caching:** In-memory caching for Google Routes/Elevation calls to optimize response latency and minimize API fees.

### 3. Data Tier (Supabase)

- **PostgreSQL 15:** Cloud-hosted managed database on Supabase (connected via the session pooler / direct connection).
- **PostGIS:** Spatial database extension storing locations as `Point` coordinates (SRID 4326), with GIST spatial indexing for radius and route buffer searches.
- **Supabase Auth:** Manages user credentials and JWT issuance in the `auth.users` schema; application `user` profiles are keyed by `auth.users.id`.

### 4. Shared Logic (`packages/shared`)

- **Energy Model:** The canonical rule-based multiplicative model `E = Ebase × Wtraffic × Welevation × Wtemperature` with locally-calibrated weights (a physics force-model is retained as future work — see the `voltph-ev-physics` skill).
- **Validation:** Type-safe validators using `zod` to validate all API request/response payloads.

## Sequence Diagram: Trip Optimization Workflow

This diagram illustrates the flow of data when a user plans a trip and requests route optimization.

```mermaid
sequenceDiagram
    autonumber
    actor U as Driver (Mobile/Web Client)
    participant FE as Voltpath PH Client
    participant API as Voltpath PH API (Railway)
    participant DB as Supabase DB (PostgreSQL/PostGIS)
    participant G_Routes as Google Routes API
    participant G_Elev as Google Elevation API

    U->>FE: Enter Trip Plan (Origin, Destination, EV Model, Initial SoC)
    FE->>API: POST /api/trips/optimize (TripPlan Payload)

    critical Route Retrieval
        API->>G_Routes: Request Path & Traffic (Waypoints, Polyline, Duration)
        G_Routes-->>API: Return Encoded Polyline & Traffic Speeds
    end

    critical Specs & Geometry Load
        API->>DB: Query EVModel Specifications (batteryCapacityKWh, Ebase, plugTypes)
        DB-->>API: Return Vehicle Specifications
        API->>API: Decode Polyline Coordinates & Apply Ramer-Douglas-Peucker (RDP) Reduction
    end

    critical Terrain Profile Lookup
        API->>G_Elev: Request Elevation Coordinates along Path
        G_Elev-->>API: Return Slope Profiles (Meters relative to Sea Level)
    end

    critical Energy Optimization & Search
        API->>API: Apply rule-based energy model (Wtraffic x Welevation x Wtemperature) per segment
        API->>DB: Spatial Query (ST_DWithin along Route Line geography buffer)
        DB-->>API: Return Compatible Charging Stations
        API->>API: Build Recommended Charging Stops & Final SoC Waypoints
    end

    API-->>FE: Return optimized TripResult JSON
    FE->>U: Display visual map overlays, waypoint SoC steps, and charging pins
```

## Entity Relationship Diagram (ERD)

The following diagram represents the core data models and their relationships, tailored for rule-based energy estimation and crowdsourced status reporting. User credentials are managed by Supabase Auth (`auth.users`); the `USER` table is an application profile keyed by that ID.

```mermaid
erDiagram
    USER ||--o{ USER_VEHICLE : "owns"
    USER ||--o{ TRIP : "plans"
    USER ||--o{ STATION_REPORT : "submits"

    EV_MODEL ||--o{ USER_VEHICLE : "defines specification for"
    EV_MODEL ||--o{ TRIP : "is selected for"

    USER_VEHICLE {
        uuid id
        uuid userId
        uuid evModelId
        string licensePlate
        string nickname
        float currentOdometerKm
        float currentSocPercentage
    }

    USER {
        uuid id "= Supabase auth.users.id"
        string email
        string name
        timestamp createdAt
    }

    TRIP ||--o{ TRIP_WAYPOINT : "contains"
    TRIP {
        uuid id
        uuid userId
        uuid evModelId
        string originAddress
        geography originLocation
        string destinationAddress
        geography destinationLocation
        float totalDistanceKm
        float totalDurationMin
        float initialBatteryPercentage
        float finalPredictedBatteryPercentage
        timestamp createdAt
    }

    TRIP_WAYPOINT {
        uuid id
        uuid tripId
        integer sequenceNumber
        string name
        geography location
        float distanceFromStartKm
        float elevationMeters
        float predictedSocPercentage
        boolean isChargingStop
        uuid recommendedStationId
    }

    CHARGING_STATION ||--o{ STATION_REPORT : "receives"
    CHARGING_STATION ||--o{ CHARGER_CONNECTOR : "has"
    CHARGING_STATION {
        uuid id
        string name
        string provider
        geography location
        boolean isAvailable
        timestamp createdAt
    }

    CHARGER_CONNECTOR {
        uuid id
        uuid stationId
        string plugType
        float powerKW
        string status
        float pricingPhpPerKWh
    }

    STATION_REPORT {
        uuid id
        uuid stationId
        uuid userId
        string statusReport
        string comments
        timestamp createdAt
    }
```
