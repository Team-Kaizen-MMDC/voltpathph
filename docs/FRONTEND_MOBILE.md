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

- **React Native Maps:** Integrated for displaying charging stations and route polylines.
- **Lucide React Native:** Used for consistent iconography across the mobile UI.
- **Expo Constants/Status Bar:** For platform-native UI adjustments.

## 🏗 Project Structure

- **`App.tsx`**: Root component containing navigation and layout.
- **Type Safety:** Heavily relies on `@voltph/shared` for consistency with the backend.

## 📱 Platform Specifics

- **Safe Area Management:** Uses `SafeAreaView` to handle notches and home indicators.
- **Responsive Layout:** Flexbox-based design to ensure compatibility across various screen sizes.

## 🔌 Connection Note

When testing on a physical device, ensure your `baseUrl` for API calls points to your computer's local IP address (e.g., `http://192.168.1.x:3001`) instead of `localhost`.
