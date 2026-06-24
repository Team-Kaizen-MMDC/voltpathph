---
name: voltph-frontend
description: Expert guidance for Voltpath PH frontend development, covering React (Web) and React Native (Mobile) using TypeScript and Turborepo.
---

# Voltpath PH Frontend Skill

Expert workflows for building and maintaining the Voltpath PH Web and Mobile applications.

## 🛠 Tech Stack
- **Web:** React + Vite + TypeScript (located in `apps/web`)
- **Mobile:** React Native + Expo + TypeScript (located in `apps/mobile`)
- **Shared:** Logic and types in `packages/shared`

## 🚀 Key Workflows

### 1. Shared Types Usage
Always check `packages/shared/src/index.ts` for existing interfaces before creating new ones in the app-specific folders.

### 2. Component Development
- Prefer functional components with hooks.
- Use **Lucide React** for icons on Web and **Lucide React Native** for Mobile.
- Ensure components are responsive for mobile viewports.

### 3. API Integration
- Use the shared `TripPlan` and `TripResult` interfaces when calling the backend.
- Handle loading and error states for all asynchronous operations.

## 📱 Mobile-Specific Guidance
- Use `SafeAreaView` from `react-native` for layout.
- Test changes using the Expo Go app or an emulator.
- Use `react-native-maps` for all geospatial visualizations.
