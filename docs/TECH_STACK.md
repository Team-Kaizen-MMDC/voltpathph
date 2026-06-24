# Technical Stack Documentation 🛠

![Stack Version](https://img.shields.io/badge/stack-v1.0.0--beta-blue)

This document provides a detailed breakdown of the technologies, libraries, and architectural decisions made for Voltpath PH.

## 🏗 Architectural Pattern: Monorepo

Voltpath PH uses a **Turborepo** monorepo structure to manage multiple applications and shared packages.

- **Benefits:**
  - Shared TypeScript types between API and Frontends.
  - Unified linting and formatting rules.
  - Efficient caching of builds and tests.

## 🔙 Backend (apps/api)

- **Runtime:** Node.js (LTS)
- **Framework:** Express.js with TypeScript
- **ORM:** TypeORM (chosen over Prisma for first-class PostGIS `geography` support)
- **Database:** Supabase-managed PostgreSQL 15
- **Geospatial:** PostGIS extension
- **Authentication:** Supabase Auth (API verifies Supabase-issued JWTs)
- **SDKs:** `@googlemaps/google-maps-services-js`

## 🖥 Frontend - Web (apps/web)

- **Library:** React (v18)
- **Build Tool:** Vite
- **Data Fetching:** `axios` & `@tanstack/react-query`
- **Styling:** Vanilla CSS / CSS Modules
- **Icons:** Lucide React

## 📱 Frontend - Mobile (apps/mobile)

- **Framework:** Expo / React Native
- **Data Fetching:** `axios` & `@tanstack/react-query`
- **Maps:** `react-native-maps` (Google Maps Provider)
- **Icons:** Lucide React Native

## 📦 Shared Package (packages/shared)

- **Purpose:** Contains DTOs, validation schemas (using `zod`), and common utilities.

## 🔌 External APIs & Integrations

- **Google Maps Platform:**
  - **Routes API:** For traffic-aware routing and distance calculations.
  - **Places API:** For location search and autocomplete.
  - **Elevation API:** For terrain/grade profiles feeding the energy model.
- **Supabase:** Managed PostgreSQL + PostGIS, **Supabase Auth** (JWT/credentials), and storage.
- **OpenChargeMap (Optional):** Potential data source for charging station locations in the Philippines.

## 🔄 CI/CD & DevOps

- **Version Control:** Git (GitHub)
- **CI:** GitHub Actions (lint → build → test on every PR to `main`).
- **Hosting (canonical):**
  - **API:** Railway (Node.js Express container; `railway.json`).
  - **Web:** Railway static (`serve`) — or Vercel/Netlify/Cloudflare Pages for CDN + preview URLs.
  - **DB + Auth + Storage:** Supabase (PostgreSQL 15 + PostGIS + Supabase Auth).
  - **Mobile:** Expo Application Services (EAS).
