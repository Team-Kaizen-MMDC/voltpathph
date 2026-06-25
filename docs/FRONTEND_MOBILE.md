# Frontend Mobile Documentation 📱🇵🇭

![Mobile Version](https://img.shields.io/badge/mobile-v1.0.0--beta-blue)

The Voltpath PH Mobile application is built with React Native and Expo. It is optimized for on-the-go EV trip monitoring and locating charging stations across the Philippines.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- **Expo Go** app installed on your iOS/Android device.
- Local API reachable from your mobile device.
- Set `EXPO_PUBLIC_API_URL` in the root `.env` (copied from the root `.env.example`); use your dev machine's LAN IP on a physical device. (Mobile env loading is wired when the API integration lands.)

### Local Development

1. Navigate to the mobile directory: `cd apps/mobile`
2. Install dependencies: `npm install`
3. Start Expo: `npm run start`
4. Scan the QR code with your device or run on an emulator (`a` for Android, `i` for iOS).

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

## 📱 Platform Specifics

- **Safe Area Management:** Uses `SafeAreaView` to handle notches and home indicators.
- **Responsive Layout:** Flexbox-based design to ensure compatibility across various screen sizes.

## 🔌 Connection Note

When testing on a physical device, ensure your `baseUrl` for API calls points to your computer's local IP address (e.g., `http://192.168.1.x:3001`) instead of `localhost`.
