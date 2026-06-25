import { Client } from "@googlemaps/google-maps-services-js";
import type { PlaceResult } from "@voltph/shared";
import { config } from "../config";

const client = new Client({});

/**
 * Offline gazetteer of common Philippine locations, used as a keyless fallback
 * so place search works in local dev without a Google Maps key. Replaced by live
 * Geocoding results when GOOGLE_MAPS_API_KEY is set.
 */
const GAZETTEER: PlaceResult[] = [
  {
    description: "Manila, Metro Manila",
    latitude: 14.5995,
    longitude: 120.9842,
  },
  {
    description: "Bonifacio Global City (BGC), Taguig",
    latitude: 14.5509,
    longitude: 121.0513,
  },
  {
    description: "Quezon City, Metro Manila",
    latitude: 14.676,
    longitude: 121.0437,
  },
  {
    description: "Makati, Metro Manila",
    latitude: 14.5547,
    longitude: 121.0244,
  },
  { description: "Tagaytay, Cavite", latitude: 14.1153, longitude: 120.9621 },
  {
    description: "Cavite City, Cavite",
    latitude: 14.4791,
    longitude: 120.8969,
  },
  { description: "Antipolo, Rizal", latitude: 14.5882, longitude: 121.176 },
  {
    description: "Batangas City, Batangas",
    latitude: 13.7565,
    longitude: 121.0583,
  },
  { description: "Baguio, Benguet", latitude: 16.4023, longitude: 120.596 },
  { description: "Angeles, Pampanga", latitude: 15.145, longitude: 120.5887 },
];

/**
 * Search for places by free-text query. Uses Google Geocoding (server-side, so
 * the API key never reaches the client) when configured; otherwise falls back to
 * a small built-in PH gazetteer.
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const key = config.googleMaps.apiKey;
  if (key) {
    try {
      const res = await client.geocode({
        params: { address: q, region: "ph", key },
        timeout: config.googleMaps.geocodeTimeoutMs,
      });
      return res.data.results.slice(0, config.places.searchLimit).map((r) => ({
        description: r.formatted_address,
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      }));
    } catch {
      // fall through to the gazetteer
    }
  }

  const lower = q.toLowerCase();
  return GAZETTEER.filter((p) =>
    p.description.toLowerCase().includes(lower),
  ).slice(0, config.places.searchLimit);
}
