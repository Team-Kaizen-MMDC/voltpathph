# Frontend Mobile Documentation 📱🇵🇭

![Mobile Version](https://img.shields.io/badge/mobile-v1.0.0--beta-blue)

The Voltpath PH Mobile application is built with React Native and Expo. It is optimized for on-the-go EV trip monitoring and locating charging stations across the Philippines.

> **Status:** The three MVP screens, navigation, Supabase Auth, and place search are implemented and pass `npm run typecheck` (wired into CI), but are **not yet runtime-verified on a simulator/device**. Run via Expo Go (below) to validate the UI.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- **Expo Go** app installed on your iOS/Android device.
- The API running locally and reachable from the device.
- `EXPO_PUBLIC_API_URL` set in the root `.env` (copied from `.env.example`) — use your dev machine's LAN IP on a physical device, **not** `localhost`.

### Local Development

1. From the repo root, start the backend: `npm run db:up` then `npm run dev` (API on `:3001`).
2. Set `EXPO_PUBLIC_API_URL` in the root `.env` (LAN IP for a physical device).
3. Start Expo: `cd apps/mobile && npm run start`.
4. Open in **Expo Go** (scan the QR) or an emulator (`a` for Android, `i` for iOS).

## 🗺 Features & Libraries

- **Navigation:** `@react-navigation/native` + native-stack across three screens.
- **Auth:** Supabase Auth (`@supabase/supabase-js`) with a **conditional sign-in gate** — enforced only when `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` are set; otherwise the app runs open (matching the API's dev bypass). The axios client attaches the bearer token automatically.
- **Place search:** debounced origin/destination autocomplete via the API's `/places/search` proxy, so the Google key stays server-side (no key on device).
- **Data:** `@tanstack/react-query` + `axios` via `api/client.ts` (base URL from `EXPO_PUBLIC_API_URL`).
- **Maps:** `react-native-maps` shows origin, destination, and charging-station markers. iOS uses Apple Maps (no key); **Android requires a Google Maps API key** — set `android.config.googleMaps.apiKey` in `app.json` (or inject it at EAS build). It is currently blank, so configure it before testing maps on Android.
- **Lucide React Native / Expo Status Bar:** iconography and platform UI.

## 🏗 Project Structure

- **`App.tsx`** — providers (`QueryClientProvider`, `SafeAreaProvider`) + native-stack navigator.
- **`config.ts`** — `EXPO_PUBLIC_API_URL` base URL.
- **`api/client.ts`** — axios instance (with a Supabase bearer-token interceptor) + `getEvModels` / `optimizeTrip` / `searchPlaces`.
- **`auth/`** — `supabase.ts` (client; null when unconfigured) + `AuthContext.tsx` (provider / `useAuth`).
- **`components/`** — `PlaceSearchInput` (debounced autocomplete) and `SignOutButton`.
- **`navigation/types.ts`** — `RootStackParamList`.
- **`theme.ts`** — color palette.
- **`screens/`**:
  - `SignInScreen` — email/password sign-in (shown only when auth is configured).
  - `TripPlannerScreen` — pick an EV model, search origin/destination, enter battery %, plan the trip.
  - `ResultScreen` — distance / duration / energy, a **green/amber/red reachability verdict**, a `MapView`, and the charging-station list.
  - `StationDetailScreen` — station provider, connectors, power, availability.
- **Type Safety:** shares DTOs with the backend via `@voltph/shared`; run `npm run typecheck` (also wired into CI).

## ⚙️ Configuration & graceful fallbacks

The app runs with **no external services** for local UI testing; each integration activates only when configured:

| Capability        | Needs                                                        | Without it                                                                          |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| API base URL      | `EXPO_PUBLIC_API_URL`                                        | defaults to `http://localhost:3001`                                                 |
| Sign-in gate      | `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` | auth is skipped — app opens straight to Trip Planner (the API's dev-bypass applies) |
| Live place search | `GOOGLE_MAPS_API_KEY` **on the API**                         | `/places/search` returns a built-in PH gazetteer                                    |
| Android map tiles | `android.config.googleMaps.apiKey` in `app.json`             | iOS uses Apple Maps (works); the Android map renders blank                          |

## 📱 Platform Specifics

- **Safe Area Management:** Uses `SafeAreaView` to handle notches and home indicators.
- **Responsive Layout:** Flexbox-based design to ensure compatibility across various screen sizes.

## 🔌 Connection Note

When testing on a physical device, ensure your `baseUrl` for API calls points to your computer's local IP address (e.g., `http://192.168.1.x:3001`) instead of `localhost`.
