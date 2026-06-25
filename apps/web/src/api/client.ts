import axios from "axios";
import type { EVModel, TripPlan, TripResult } from "@voltph/shared";
import { API_URL } from "../config";

/** Shared axios instance for the Voltpath PH API. */
export const api = axios.create({ baseURL: `${API_URL}/api` });

// Demo fallbacks keep the UI functional when the backend is offline (e.g. during
// a UI-only demo). Real calls are attempted first; these only apply on failure.
const FALLBACK_MODELS: EVModel[] = [
  {
    id: "demo-byd-atto3",
    make: "BYD",
    model: "Atto 3",
    batteryCapacityKWh: 60.5,
    averageConsumptionKWhPerKm: 0.16,
    plugTypes: ["Type 2", "CCS2"],
  },
  {
    id: "demo-geely-ex5",
    make: "Geely",
    model: "EX5 Em-i Max",
    batteryCapacityKWh: 60.22,
    averageConsumptionKWhPerKm: 0.15,
    plugTypes: ["Type 2", "CCS2"],
  },
];

const FALLBACK_TRIP: TripResult = {
  totalDistanceKm: 85.2,
  totalDurationMin: 110,
  estimatedBatteryConsumptionKWh: 13.6,
  remainingBatteryPercentage: 77.5,
  recommendedChargingStops: [],
};

export async function getEvModels(): Promise<EVModel[]> {
  try {
    const { data } = await api.get<EVModel[]>("/ev-models");
    return data;
  } catch (err) {
    console.warn("EV models request failed; using demo data", err);
    return FALLBACK_MODELS;
  }
}

export async function optimizeTrip(plan: TripPlan): Promise<TripResult> {
  try {
    const { data } = await api.post<TripResult>("/trips/optimize", plan);
    return data;
  } catch (err) {
    console.warn("Trip optimize request failed; using demo result", err);
    return FALLBACK_TRIP;
  }
}
