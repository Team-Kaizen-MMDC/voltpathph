import axios from "axios";
import type {
  EVModel,
  PlaceResult,
  TripPlan,
  TripResult,
} from "@voltph/shared";
import { API_URL } from "../config";
import { supabase } from "../auth/supabase";

/** Shared axios instance for the Voltpath PH API. */
export const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach the Supabase access token (when signed in) so the API can verify it.
// No-op when auth is not configured (local dev) — the API's dev bypass applies.
api.interceptors.request.use(async (config) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getEvModels(): Promise<EVModel[]> {
  const { data } = await api.get<EVModel[]>("/ev-models");
  return data;
}

export async function optimizeTrip(plan: TripPlan): Promise<TripResult> {
  const { data } = await api.post<TripResult>("/trips/optimize", plan);
  return data;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (query.trim().length < 2) return [];
  const { data } = await api.get<PlaceResult[]>("/places/search", {
    params: { q: query },
  });
  return data;
}
