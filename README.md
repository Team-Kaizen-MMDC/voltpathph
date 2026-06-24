# Voltpath PH 🔋🇵🇭

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![Tech Stack](https://img.shields.io/badge/stack-Turborepo%20|%20Node.js%20|%20React%20|%20PostGIS-green)
![License](https://img.shields.io/badge/license-MIT-yellow)
[![Project Kanban](https://img.shields.io/badge/Kanban-Voltpath%20PH-blueviolet?logo=github)](https://github.com/orgs/Team-Kaizen-MMDC/projects/5)

**Voltpath PH** is a comprehensive EV efficiency and navigation optimization platform tailored for the Philippines. It helps EV owners plan trips, predict battery consumption based on local traffic conditions, and locate charging stations across the archipelago.

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
voltpathph/
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
   git clone https://github.com/Team-Kaizen-MMDC/voltpathph.git
   cd voltpathph
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Set up environment variables:
   Copy `.env.example` in `apps/api` to `.env` and fill in your credentials.

5. Run the development environment:
   ```bash
   npm run dev
   ```

## 🌍 Deployment

We use **Railway** for production hosting. It automatically handles our monorepo structure via the `railway.json` configuration. See the [DevOps Guide](docs/DEVOPS.md) for detailed instructions on provisioning PostgreSQL/PostGIS and setting up service networking.

## 📖 Documentation

- [Project Kanban Board](https://github.com/orgs/Team-Kaizen-MMDC/projects/5) - Track sprints, backlog, and roadmap.
- [Technical Stack](./docs/TECH_STACK.md)
- [Database Schema & Architecture Guide](./docs/DATABASE.md)
- [Backend API Guide](./docs/BACKEND.md)
- [Testing & Quality Assurance Guide](./docs/TESTING.md)
- [Frontend Web Guide](./docs/FRONTEND_WEB.md)
- [Frontend Mobile Guide](./docs/FRONTEND_MOBILE.md)
- [DevOps, Deployment & Branching Strategy](./docs/DEVOPS.md)
- [Onboarding Plan for Juniors](./docs/ONBOARDING.md)
- [Architecture Diagram](./docs/ARCHITECTURE.md)

## 📄 License

MIT
