import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True only when Supabase credentials are present. When false, the app runs
 * unauthenticated (local dev) — matching the API's dev auth-bypass — so no
 * external service is required to run the app.
 */
export const isAuthConfigured = Boolean(url && anonKey);

/** Supabase client, or null when auth is not configured. */
export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // No URL-based session detection in a native app.
        detectSessionInUrl: false,
      },
    })
  : null;
