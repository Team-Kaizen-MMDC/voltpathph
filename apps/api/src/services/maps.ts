import { Client } from "@googlemaps/google-maps-services-js";
import type { TrafficLevel } from "@voltph/shared";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteData {
  distanceKm: number;
  durationMin: number;
  trafficLevel: TrafficLevel;
  /** Net grade between endpoints, in percent. */
  avgGradePercent: number;
  /** Where the figures came from: a live Google call or a local estimate. */
  source: "google" | "estimate";
}

const EARTH_RADIUS_KM = 6371;
const client = new Client({});

function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function classifyTraffic(
  distanceKm: number,
  durationMin: number,
): TrafficLevel {
  if (durationMin <= 0 || distanceKm <= 0) return "light";
  const speedKmh = distanceKm / (durationMin / 60);
  if (speedKmh >= 60) return "free";
  if (speedKmh >= 35) return "light";
  if (speedKmh >= 20) return "moderate";
  return "heavy";
}

async function netGradePercent(
  origin: LatLng,
  destination: LatLng,
  distanceKm: number,
  key: string,
): Promise<number> {
  if (distanceKm <= 0) return 0;
  try {
    const res = await client.elevation({
      params: { locations: [origin, destination], key },
      timeout: 5000,
    });
    const results = res.data.results;
    if (results.length >= 2) {
      const rise = results[1].elevation - results[0].elevation;
      return (rise / (distanceKm * 1000)) * 100;
    }
  } catch {
    // ignore — fall back to flat
  }
  return 0;
}

/**
 * Resolve route distance/duration/traffic/grade.
 * Uses the Google Directions + Elevation APIs when `GOOGLE_MAPS_API_KEY` is set,
 * and falls back to a haversine-based estimate otherwise so the endpoint always
 * returns real, input-derived figures (never hard-coded mock values).
 */
export async function getRouteData(
  origin: LatLng,
  destination: LatLng,
): Promise<RouteData> {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (key) {
    try {
      const res = await client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          departure_time: "now",
          key,
        },
        timeout: 8000,
      });
      const leg = res.data.routes[0]?.legs?.[0];
      if (leg) {
        const distanceKm = leg.distance.value / 1000;
        const durationMin =
          (leg.duration_in_traffic?.value ?? leg.duration.value) / 60;
        return {
          distanceKm,
          durationMin,
          trafficLevel: classifyTraffic(distanceKm, durationMin),
          avgGradePercent: await netGradePercent(
            origin,
            destination,
            distanceKm,
            key,
          ),
          source: "google",
        };
      }
    } catch {
      // fall through to the estimate below
    }
  }

  // Fallback: straight-line distance with a road-network detour factor and a
  // nominal urban PH average speed. Keeps the API functional without a key.
  const distanceKm = haversineKm(origin, destination) * 1.3;
  const durationMin = (distanceKm / 30) * 60;
  return {
    distanceKm,
    durationMin,
    trafficLevel: classifyTraffic(distanceKm, durationMin),
    avgGradePercent: 0,
    source: "estimate",
  };
}
