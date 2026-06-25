import { Client } from "@googlemaps/google-maps-services-js";
import type { RouteSegment, TrafficLevel } from "@voltph/shared";
import { getTemperatureC } from "./weather";
import { config } from "../config";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteData {
  distanceKm: number;
  durationMin: number;
  /** Per-segment breakdown for the Tier-2 energy model. */
  segments: RouteSegment[];
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

async function fetchElevations(
  points: LatLng[],
  key: string,
): Promise<number[] | null> {
  if (points.length < 2 || points.length > config.googleMaps.maxElevationPoints)
    return null;
  try {
    const res = await client.elevation({
      params: { locations: points, key },
      timeout: config.googleMaps.elevationTimeoutMs,
    });
    return res.data.results.map((r) => r.elevation);
  } catch {
    return null;
  }
}

function estimateFallback(
  origin: LatLng,
  destination: LatLng,
  temperatureC?: number,
): RouteData {
  // No API key / API failure: straight-line distance with a road-network detour
  // factor and a nominal urban PH average speed. Keeps the API functional.
  const distanceKm =
    haversineKm(origin, destination) * config.routing.detourFactor;
  const durationMin = (distanceKm / config.routing.fallbackAvgSpeedKmh) * 60;
  return {
    distanceKm,
    durationMin,
    source: "estimate",
    segments: [
      {
        distanceKm,
        durationMin,
        trafficLevel: classifyTraffic(distanceKm, durationMin),
        deltaElevationM: 0,
        temperatureC,
      },
    ],
  };
}

/**
 * Resolve route distance/duration and a per-segment breakdown (distance,
 * traffic-scaled duration, signed elevation change, ambient temperature) for the
 * Tier-2 energy model.
 *
 * Uses Google Directions (per-step geometry) + one Elevation lookup when
 * `GOOGLE_MAPS_API_KEY` is set; otherwise returns a single-segment haversine
 * estimate. Ambient temperature comes from Open-Meteo (no key) at the route
 * midpoint and is attached to every segment; it falls back to the energy model's
 * baseline when the lookup fails.
 */
export async function getRouteData(
  origin: LatLng,
  destination: LatLng,
): Promise<RouteData> {
  const midpoint = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };
  const temperatureC =
    (await getTemperatureC(midpoint.lat, midpoint.lng)) ?? undefined;

  const key = config.googleMaps.apiKey;
  if (!key) return estimateFallback(origin, destination, temperatureC);

  try {
    const res = await client.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        departure_time: "now",
        key,
      },
      timeout: config.googleMaps.directionsTimeoutMs,
    });

    const leg = res.data.routes[0]?.legs?.[0];
    const steps = leg?.steps;
    if (!leg || !steps?.length) {
      return estimateFallback(origin, destination, temperatureC);
    }

    const totalDistanceKm = leg.distance.value / 1000;
    const baseDurationSec = leg.duration.value || 1;
    const trafficDurationSec =
      leg.duration_in_traffic?.value ?? baseDurationSec;
    // Distribute observed traffic delay proportionally across steps so the
    // time-based auxiliary (AC) term reflects congestion.
    const trafficFactor = trafficDurationSec / baseDurationSec;

    // Boundary points: start of first step, then the end of every step.
    const points: LatLng[] = [
      { lat: steps[0].start_location.lat, lng: steps[0].start_location.lng },
      ...steps.map((s) => ({
        lat: s.end_location.lat,
        lng: s.end_location.lng,
      })),
    ];
    const elevations = await fetchElevations(points, key);

    const segments: RouteSegment[] = steps.map((step, i) => {
      const distanceKm = step.distance.value / 1000;
      const durationMin = ((step.duration.value || 0) * trafficFactor) / 60;
      const deltaElevationM = elevations
        ? elevations[i + 1] - elevations[i]
        : 0;
      return {
        distanceKm,
        durationMin,
        deltaElevationM,
        trafficLevel: classifyTraffic(distanceKm, durationMin),
        temperatureC,
      };
    });

    return {
      distanceKm: totalDistanceKm,
      durationMin: trafficDurationSec / 60,
      source: "google",
      segments,
    };
  } catch {
    return estimateFallback(origin, destination, temperatureC);
  }
}
