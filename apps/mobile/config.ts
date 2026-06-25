// Base URL of the Voltpath PH API. Set EXPO_PUBLIC_API_URL in the root `.env`
// (Expo inlines EXPO_PUBLIC_* at build time). On a physical device use your dev
// machine's LAN IP (e.g. http://192.168.1.10:3001), not localhost.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
