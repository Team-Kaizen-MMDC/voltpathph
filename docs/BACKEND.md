# Backend API Documentation 🔙💻

![Backend Version](https://img.shields.io/badge/backend-v1.0.0--alpha-blue)

The VoltPH Backend is a Node.js Express application built with TypeScript and TypeORM, using PostgreSQL and PostGIS for geospatial data management.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for local database)
- PostgreSQL with PostGIS extension

### Environment Variables
Create a `.env` file in `apps/api/` with the following variables:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=voltph
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Local Development
1. Navigate to the api directory: `cd apps/api`
2. Run in development mode: `npm run dev`
3. Build for production: `npm run build`
4. Start production server: `npm run start`

> **Note:** If you encounter `TS2564` errors regarding property initialization in entities, ensure you are using definite assignment assertions (`!`) as per our TypeORM standards. Missing types for `cors` should be installed as a dev dependency (`@types/cors`).

## 🛣 API Endpoints Reference

### EV Models
Manage and retrieve supported Electric Vehicle specifications.

- **GET `/api/ev-models`**
  - Description: Returns a list of all supported EV models.
  - Response: `Array<EVModel>`

- **GET `/api/ev-models/:id`**
  - Description: Returns details for a specific EV model.
  - Parameters: `id` (UUID)
  - Response: `EVModel`

### Charging Stations
Geospatial search for charging infrastructure.

- **GET `/api/stations/nearby`**
  - Description: Finds charging stations within a specified radius.
  - Query Parameters:
    - `lat` (float, required): Latitude of the center point.
    - `lng` (float, required): Longitude of the center point.
    - `radius` (int, optional): Search radius in meters (default: 5000).
  - Response: `Array<ChargingStation>`

### Trip Optimization
The core engine for route and battery calculation.

- **POST `/api/trips/optimize`**
  - Description: Calculates route, battery consumption, and recommends charging stops.
  - Request Body: `TripPlan`
  - Response: `TripResult`

## 🗄 Database & Geospatial
VoltPH uses **PostGIS** to handle geographical data.

- **Spatial Indexing:** The `ChargingStation` table has a GIST index on the `location` column.
- **Coordinate System:** All points use **SRID 4324** (WGS 84).
- **Entities:** Located in `src/entities/`.
  - `EVModel`: Specifications (Battery, Consumption, Plugs).
  - `ChargingStation`: Geographical point and provider details.

## 🧪 Testing & Quality
- **Linter:** ESLint
- **Formatter:** Prettier
- **Testing Framework:** Jest (Planned)

Run linting:
```bash
npm run lint
```
