# System Architecture 🏛

![Architecture Version](https://img.shields.io/badge/arch-v1.0.0-blue)

This document describes the high-level architecture of the VoltPH platform.

## Architecture Diagram

```mermaid
graph TD
    User([User])
    WebApp[Web App - React]
    MobileApp[Mobile App - React Native]
    API[API - Node.js/Express]
    DB[(PostgreSQL + PostGIS)]
    GMap[Google Maps API]
    Shared[Shared Package]

    User --> WebApp
    User --> MobileApp
    WebApp -.-> Shared
    MobileApp -.-> Shared
    API -.-> Shared

    WebApp --> API
    MobileApp --> API
    API --> DB
    API --> GMap
```

## Component Breakdown

### 1. Client Applications
- **Web App:** A Vite-powered React application for desktop users.
- **Mobile App:** An Expo-powered React Native application for users on the go.
- Both apps share business logic and type definitions via the `shared` package.

### 2. Backend API
- **Technology:** Express.js with TypeScript.
- **Responsibilities:**
  - Managing EV model data.
  - Locating charging stations.
  - Orchestrating trip optimization by combining Google Maps data with EV consumption models.

### 3. Data Layer
- **PostgreSQL:** Primary relational store.
- **PostGIS:** Extension used for storing charging station locations as `Point` geographies, allowing for efficient "nearby" searches.

### 4. Shared Logic (`packages/shared`)
- This is a local NPM package within the monorepo.
- It contains `interfaces`, `validation schemas`, and `calculation utilities` to ensure consistency across all services.

## Sequence Diagram: Trip Optimization Workflow

This diagram illustrates the flow of data when a user plans a trip and requests route optimization.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (Web/Mobile)
    participant API as VoltPH API
    participant DB as PostgreSQL/PostGIS
    participant G as Google Maps API

    U->>FE: Enter Origin/Destination & Select EV
    FE->>API: POST /api/trips/optimize (TripPlan)
    API->>G: Request Route (Polyline, Traffic, Distance)
    G-->>API: Return Route Data
    API->>DB: Fetch EV Model Specifications
    DB-->>API: Return EVModel Details
    API->>API: Calculate Estimated Consumption
    API->>DB: Spatial Query: Find Stations along Route
    DB-->>API: Return Nearby Charging Stations
    API->>API: Finalize Trip Result
    API-->>FE: Return TripResult (Optimized Plan)
    FE->>U: Display Route & Charging Recommendations
```

## Entity Relationship Diagram (ERD)

The following diagram represents the core data models and their relationships.

```mermaid
erDiagram
    USER ||--o{ TRIP : "plans"
    USER {
        uuid id
        string email
        string name
    }
    EV_MODEL ||--o{ TRIP : "is used for"
    EV_MODEL {
        uuid id
        string make
        string model
        float batteryCapacityKWh
        float averageConsumptionKWhPerKm
        string[] plugTypes
    }
    TRIP {
        uuid id
        uuid userId
        uuid evModelId
        json origin
        json destination
        float totalDistanceKm
    }
    CHARGING_STATION {
        uuid id
        string name
        string provider
        geography location
        string[] plugTypes
        float powerKW
        boolean isAvailable
    }
```
