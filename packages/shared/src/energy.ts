/**
 * Rule-based EV energy consumption model — CANONICAL for Voltpath PH.
 *
 *   E = Ebase × Wtraffic × Welevation × Wtemperature   (Wh/km, per route segment)
 *
 * Weight factors are centered on 1.0 at baseline conditions (light traffic,
 * flat terrain, ~30 °C). The constants below are PLACEHOLDER calibration values:
 * they must be replaced by the multiplicative weights derived from the Philippine
 * test-drive regression (see NFR-01/NFR-02 and the `voltph-ev-physics` skill).
 */

export type TrafficLevel = "free" | "light" | "moderate" | "heavy";

/** PH baseline ambient temperature (°C) at which Wtemperature ≈ 1.0. */
export const BASELINE_TEMPERATURE_C = 30;

// --- Placeholder calibration constants (replace with regression results) ---
export const TRAFFIC_WEIGHTS: Record<TrafficLevel, number> = {
  free: 0.95,
  light: 1.0,
  moderate: 1.15,
  heavy: 1.35,
};

export interface SegmentConditions {
  trafficLevel?: TrafficLevel;
  /** Net road grade for the segment, in percent (uphill positive, downhill negative). */
  gradePercent?: number;
  /** Ambient temperature in °C. Defaults to the PH baseline when omitted. */
  temperatureC?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function trafficWeight(level: TrafficLevel = "light"): number {
  return TRAFFIC_WEIGHTS[level] ?? 1.0;
}

export function elevationWeight(gradePercent = 0): number {
  // Uphill raises consumption; downhill recovers some energy via regen (smaller factor).
  const w =
    gradePercent >= 0 ? 1 + 0.04 * gradePercent : 1 + 0.02 * gradePercent;
  return clamp(w, 0.8, 1.6);
}

export function temperatureWeight(
  temperatureC = BASELINE_TEMPERATURE_C,
): number {
  // AC load rises with heat above a comfort baseline of 24 °C.
  const w = 1 + 0.012 * (temperatureC - 24);
  return clamp(w, 0.9, 1.3);
}

/** Convert kWh/km to Wh/km. */
export const kWhPerKmToWhPerKm = (kWhPerKm: number): number => kWhPerKm * 1000;

/**
 * Estimated consumption in Wh/km for a segment.
 * @param baseWhPerKm Ebase — baseline consumption from the EV model (Wh/km).
 */
export function segmentConsumptionWhPerKm(
  baseWhPerKm: number,
  conditions: SegmentConditions = {},
): number {
  return (
    baseWhPerKm *
    trafficWeight(conditions.trafficLevel) *
    elevationWeight(conditions.gradePercent) *
    temperatureWeight(conditions.temperatureC)
  );
}

export interface EnergyEstimateInput {
  distanceKm: number;
  /** From `EVModel.averageConsumptionKWhPerKm`. */
  baseConsumptionKWhPerKm: number;
  batteryCapacityKWh: number;
  initialSocPercent: number;
  conditions?: SegmentConditions;
}

export interface EnergyEstimate {
  /** Effective consumption rate used (Wh/km). */
  whPerKm: number;
  /** Total energy for the trip (kWh). */
  totalKWh: number;
  /** Percentage of battery consumed. */
  consumedPercent: number;
  /** Predicted remaining State-of-Charge (%), not clamped to 0. */
  remainingSocPercent: number;
}

export function estimateTripEnergy(input: EnergyEstimateInput): EnergyEstimate {
  const baseWhPerKm = kWhPerKmToWhPerKm(input.baseConsumptionKWhPerKm);
  const whPerKm = segmentConsumptionWhPerKm(baseWhPerKm, input.conditions);
  const totalKWh = (whPerKm * input.distanceKm) / 1000;
  const consumedPercent =
    input.batteryCapacityKWh > 0
      ? (totalKWh / input.batteryCapacityKWh) * 100
      : 0;
  const remainingSocPercent = input.initialSocPercent - consumedPercent;
  return { whPerKm, totalKWh, consumedPercent, remainingSocPercent };
}
