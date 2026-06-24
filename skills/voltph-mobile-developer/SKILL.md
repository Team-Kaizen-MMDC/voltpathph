---
name: voltph-mobile-developer
description: Specialized workflows for the Voltpath PH React Native/Expo mobile application. Use when developing mobile-specific components, handling GPS/sensors, integrating offline caching, or configuring EAS builds.
---

# Voltpath PH Mobile Developer Skill

Guidance for developing the Voltpath PH mobile application, focusing on cross-platform performance (iOS/Android), native map integration, offline-first reliability, and battery-efficient location tracking in the Philippines.

## 🛠 Tech Stack & Tools
- **Framework:** Expo / React Native with TypeScript
- **State Management:** `@tanstack/react-query` & local state
- **Maps:** `react-native-maps` (configured with Google Maps provider for both platforms)
- **Local Storage:** `@react-native-async-storage/async-storage` (for offline caching)
- **Deployment:** Expo Application Services (EAS CLI)

## 🚀 Key Workflows

### 1. Geospatial & Maps Integration
- Use `react-native-maps` and ensure `<MapView>` uses the `'google'` provider explicitly.
- Handle zoom and region changes efficiently using `onRegionChangeComplete` rather than `onRegionChange` to avoid performance degradation.
- Cache map pins of nearby charging stations in the client.

### 2. Location Tracking & Battery Conservation
- Request location permissions using `expo-location`.
- Use passive location tracking or configure sensible updates (e.g., update only when moving > 10 meters) during navigation to conserve the user's phone battery.
- Handle permission denial gracefully by prompting the user to search manually.

### 3. Offline Caching & Intermittent Networks
- Philippine cellular networks can be highly unstable on highways (e.g., Maharlika Highway, Dalton Pass).
- Cache the user's current route details and a subset of nearby charging stations to local storage using `AsyncStorage`.
- Use a state indicator (e.g., "Offline Mode") to inform the user when network connectivity is lost, but allow them to view cached routes and stations.

### 4. EAS Build & OTA Updates
- Maintain `app.json` updates carefully.
- Run `eas build --profile preview` to distribute testing builds (APKs/IPAs).
- Utilize `eas update` for over-the-air (OTA) updates for critical javascript bug fixes, bypassing app store review cycles.
