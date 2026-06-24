# Frontend Web Documentation 🖥🌐

![Web Version](https://img.shields.io/badge/web-v1.0.0--beta-blue)

The Voltpath PH Web application is a modern React application built with TypeScript and Vite. It serves as the desktop platform for EV trip planning and station discovery.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Local API running at `http://localhost:3001` (or configured via env)

### Local Development
1. Navigate to the web directory: `cd apps/web`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

## 🏗 Component Architecture
The application is structured into functional, reusable components:

- **`App.tsx`**: Main entry point and layout definition.
- **`components/EVModelList.tsx`**: Displays the catalog of supported EV models.
- **`components/TripPlanner.tsx`**: The core interactive form for route and battery optimization.

## 🎨 Styling & UI
- **Lucide React:** Used for consistent iconography.
- **Responsive Design:** Grid-based layout designed to handle various desktop and tablet viewports.

## 📦 Shared Logic
The web app consumes shared interfaces from `@voltph/shared`:
- `EVModel`
- `TripPlan`
- `TripResult`

## 🔌 API Integration
Communication with the backend is handled via standard `fetch` calls to the following base URL: `http://localhost:3001/api`.
