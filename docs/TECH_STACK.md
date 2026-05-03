# Technical Stack Documentation 🛠

![Stack Version](https://img.shields.io/badge/stack-v1.0.0--alpha-blue)

This document provides a detailed breakdown of the technologies, libraries, and architectural decisions made for VoltPH.

## 🏗 Architectural Pattern: Monorepo
VoltPH uses a **Turborepo** monorepo structure to manage multiple applications and shared packages.

- **Benefits:**
  - Shared TypeScript types between API and Frontends.
  - Unified linting and formatting rules.
  - Efficient caching of builds and tests.

## 🔙 Backend (apps/api)
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js with TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL (v14+)
- **Geospatial:** PostGIS extension (for `geography` types and spatial indexing)
- **Authentication:** JWT (Planned)

## 🖥 Frontend - Web (apps/web)
- **Library:** React (v18)
- **Build Tool:** Vite
- **State Management:** React Context / TanStack Query (Planned)
- **Styling:** Vanilla CSS / CSS Modules
- **Icons:** Lucide React

## 📱 Frontend - Mobile (apps/mobile)
- **Framework:** Expo / React Native
- **Maps:** `react-native-maps` (Google Maps Provider)
- **Icons:** Lucide React Native

## 📦 Shared Package (packages/shared)
- **Purpose:** Contains DTOs (Data Transfer Objects), validation schemas, and common utility functions used by both API and Client apps.

## 🔌 External APIs & Integrations
- **Google Maps Platform:**
  - **Routes API:** For traffic-aware routing and distance calculations.
  - **Places API:** For location search and autocomplete.
- **OpenChargeMap (Optional):** Potential data source for charging station locations in the Philippines.

## 🔄 CI/CD & DevOps
- **Version Control:** Git (GitHub)
- **Docker:** (Planned) Containerization for API and Database.
- **Hosting:**
  - **Web:** Vercel / Netlify
  - **API:** Render / AWS ECS
  - **DB:** MongoDB Atlas (originally suggested) or Managed PostgreSQL.
