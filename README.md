# VoltPH 🔋🇵🇭

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![Tech Stack](https://img.shields.io/badge/stack-Turborepo%20|%20Node.js%20|%20React%20|%20PostGIS-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

**VoltPH** is a comprehensive EV efficiency and navigation optimization platform tailored for the Philippines. It helps EV owners plan trips, predict battery consumption based on local traffic conditions, and locate charging stations across the archipelago.

## 🚀 Key Features

- **Trip Optimization Engine:** Calculate the most efficient route considering Philippine traffic patterns and elevation.
- **Battery Efficiency Prediction:** Tailored consumption models for popular PH EV brands (BYD, Jetour, Geely, Vinfast).
- **Charging Station Locator:** Real-time map of charging stations with plug-type filtering and availability status.
- **Multi-Platform Support:** Seamless experience across Web and Mobile (React Native).

## 🛠 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/)
- **Backend:** Node.js (Express), TypeORM, PostgreSQL + PostGIS
- **Frontend (Web):** React, TypeScript, Vite
- **Frontend (Mobile):** React Native (Expo), TypeScript
- **APIs:** Google Maps (Routes, Places)

## 📁 Project Structure

```text
voltph/
├── apps/
│   ├── api/        # Node.js Express Backend
│   ├── web/        # React Web Application
│   └── mobile/     # React Native Mobile App
├── packages/
│   └── shared/     # Shared TypeScript models and logic
└── turbo.json      # Turborepo configuration
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL with PostGIS extension
- Google Maps API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/voltph.git
   cd voltph
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` in `apps/api` to `.env` and fill in your credentials.

4. Run the development environment:
   ```bash
   npm run dev
   ```

## 📖 Documentation

- [Technical Stack](./docs/TECH_STACK.md)
- [Backend API Guide](./docs/BACKEND.md)
- [Frontend Web Guide](./docs/FRONTEND_WEB.md)
- [Frontend Mobile Guide](./docs/FRONTEND_MOBILE.md)
- [Onboarding Plan for Juniors](./docs/ONBOARDING.md)
- [Architecture Diagram](./docs/ARCHITECTURE.md)

## 📄 License
MIT
