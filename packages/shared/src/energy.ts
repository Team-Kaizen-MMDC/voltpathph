/**
 * EV energy consumption model — CANONICAL for Voltpath PH.
 *
 * Two tiers share the same headline equation
 *   E = Ebase × Wtraffic × Welevation × Wtemperature   (Wh/km, per segment)
 *
 * - TIER 1 (quick estimate): a pure multiplicative model. Cheap, explainable,
 *   good for a client-side preview. Calibrate via LOG-LINEAR regression so the
 *   factors are genuinely multiplicative (see docs/ENERGY_MODEL.md).
 *
 * - TIER 2 (authoritative, used by the API): the same model decomposed into
 *   physically honest, per-segment terms — traffic-scaled rolling/aero
 *   (distance-based), SIGNED elevation potential energy (with regen on
 *   descents), and TIME-based auxiliary/AC load. This fixes the two known
 *   approximations of the pure multiplicative form (AC is time- not
 *   distance-based; elevation is signed and can recover energy).
 *
 * All calibration constants below are PLACEHOLDERS for the Geely EX5 Em-i Max
 * reference vehicle and MUST be replaced with values fitted from the Philippine
 * test-drive regression (NFR-01/NFR-02).
 */

export type TrafficLevel = "free" | "light" | "moderate" | "heavy";

/** PH baseline ambient temperature (°C) at which Wtemperature ≈ 1.0. */
export const BASELINE_TEMPERATURE_C = 30;

/** Standard gravity (m/s²). */
export const GRAVITY = 9.81;

// --- Placeholder calibration constants (replace with regression results) ---
export const TRAFFIC_WEIGHTS: Record<TrafficLevel, number> = {
  free: 0.95,
  light: 1.0,
  moderate: 1.15,
  heavy: 1.35,
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// =============================================================================
// TIER 1 — pure multiplicative model (quick estimate)
// =============================================================================

export interface SegmentConditions {
  trafficLevel?: TrafficLevel;
  /** Net road grade for the segment, in percent (uphill positive, downhill negative). */
  gradePercent?: number;
  /** Ambient temperature in °C. Defaults to the PH baseline when omitted. */
  temperatureC?: number;
}

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
 * TIER 1 — estimated consumption in Wh/km for a segment via the pure
 * multiplicative model.
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

/** TIER 1 — single-aggregate trip estimate (no segment loop). */
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

// =============================================================================
// TIER 2 — semi-physical, per-segment model (authoritative)
// =============================================================================

/**
 * Physical/auxiliary parameters of the reference vehicle (Geely EX5 Em-i Max).
 * PLACEHOLDERS — replace with measured/fitted values. For multi-vehicle support
 * these would move to per-model configuration; the MVP calibrates one vehicle.
 */
export interface VehicleParams {
  massKg: number;
  /** Battery → wheels efficiency for traction (uphill/cruise). */
  drivetrainEfficiency: number;
  /** Wheels → battery efficiency for regeneration (downhill/braking). */
  regenEfficiency: number;
  /** Constant electronics/base load (W). */
  baseAuxiliaryW: number;
  /** AC power added per °C above the comfort baseline (W/°C). */
  acWattsPerDegreeC: number;
  /** Temperature (°C) above which AC starts drawing power. */
  acComfortBaselineC: number;
  /** Cap on total auxiliary power (W). */
  maxAuxiliaryW: number;
}

export const REFERENCE_VEHICLE: VehicleParams = {
  massKg: 1900,
  drivetrainEfficiency: 0.9,
  regenEfficiency: 0.65,
  baseAuxiliaryW: 300,
  acWattsPerDegreeC: 120,
  acComfortBaselineC: 24,
  maxAuxiliaryW: 3000,
};

export interface RouteSegment {
  distanceKm: number;
  durationMin: number;
  trafficLevel?: TrafficLevel;
  /** Signed elevation change over the segment (m). Preferred over gradePercent. */
  deltaElevationM?: number;
  /** Net grade (%); used to derive elevation change if deltaElevationM is absent. */
  gradePercent?: number;
  /** Ambient temperature (°C). Defaults to the PH baseline when omitted. */
  temperatureC?: number;
}

/** Signed elevation energy at the battery (Wh): positive uphill, negative (recovered) downhill. */
export function elevationEnergyWh(
  deltaElevationM: number,
  v: VehicleParams = REFERENCE_VEHICLE,
): number {
  const mechanicalWh = (v.massKg * GRAVITY * deltaElevationM) / 3600; // J → Wh
  return deltaElevationM >= 0
    ? mechanicalWh / v.drivetrainEfficiency // climbing costs extra
    : mechanicalWh * v.regenEfficiency; // descending recovers a fraction
}

/** Instantaneous auxiliary power (W) as a function of ambient temperature. */
export function auxiliaryPowerW(
  temperatureC: number = BASELINE_TEMPERATURE_C,
  v: VehicleParams = REFERENCE_VEHICLE,
): number {
  const acW = Math.max(
    0,
    (temperatureC - v.acComfortBaselineC) * v.acWattsPerDegreeC,
  );
  return clamp(v.baseAuxiliaryW + acW, 0, v.maxAuxiliaryW);
}

/** Time-based auxiliary energy over a segment (Wh). */
export function auxiliaryEnergyWh(
  temperatureC: number,
  durationMin: number,
  v: VehicleParams = REFERENCE_VEHICLE,
): number {
  return auxiliaryPowerW(temperatureC, v) * (durationMin / 60);
}

function segmentDeltaElevationM(seg: RouteSegment): number {
  if (typeof seg.deltaElevationM === "number") return seg.deltaElevationM;
  if (typeof seg.gradePercent === "number") {
    return (seg.gradePercent / 100) * seg.distanceKm * 1000;
  }
  return 0;
}

/** TIER 2 — battery energy (Wh) for one segment: rolling/aero + elevation + auxiliary. */
export function segmentEnergyWh(
  baseWhPerKm: number,
  seg: RouteSegment,
  v: VehicleParams = REFERENCE_VEHICLE,
): number {
  const driveWh =
    baseWhPerKm * seg.distanceKm * trafficWeight(seg.trafficLevel);
  const elevWh = elevationEnergyWh(segmentDeltaElevationM(seg), v);
  const auxWh = auxiliaryEnergyWh(
    seg.temperatureC ?? BASELINE_TEMPERATURE_C,
    seg.durationMin,
    v,
  );
  return driveWh + elevWh + auxWh;
}

export interface RouteEnergyInput {
  segments: RouteSegment[];
  /** From `EVModel.averageConsumptionKWhPerKm`. */
  baseConsumptionKWhPerKm: number;
  batteryCapacityKWh: number;
  initialSocPercent: number;
  vehicle?: VehicleParams;
}

export interface RouteWaypointSoc {
  distanceKm: number;
  socPercent: number;
}

export interface RouteEnergyEstimate {
  /** Effective consumption rate across the whole route (Wh/km). */
  whPerKm: number;
  totalKWh: number;
  consumedPercent: number;
  /** Predicted arrival State-of-Charge (%), not clamped. */
  remainingSocPercent: number;
  /** Lowest SoC reached along the route (matters for mid-route dips). */
  minSocPercent: number;
  /** Cumulative SoC at each segment boundary (first entry = start). */
  waypoints: RouteWaypointSoc[];
}

/**
 * TIER 2 — authoritative per-segment route estimate. Loops over segments,
 * accumulates battery energy, and tracks SoC at each waypoint.
 */
export function estimateRouteEnergy(
  input: RouteEnergyInput,
): RouteEnergyEstimate {
  const baseWhPerKm = kWhPerKmToWhPerKm(input.baseConsumptionKWhPerKm);
  const v = input.vehicle ?? REFERENCE_VEHICLE;
  const batteryWh = input.batteryCapacityKWh * 1000;

  let cumulativeWh = 0;
  let cumulativeKm = 0;
  let minSoc = input.initialSocPercent;
  const waypoints: RouteWaypointSoc[] = [
    { distanceKm: 0, socPercent: input.initialSocPercent },
  ];

  for (const seg of input.segments) {
    cumulativeWh += segmentEnergyWh(baseWhPerKm, seg, v);
    cumulativeKm += seg.distanceKm;
    const soc =
      batteryWh > 0
        ? input.initialSocPercent - (cumulativeWh / batteryWh) * 100
        : input.initialSocPercent;
    minSoc = Math.min(minSoc, soc);
    waypoints.push({ distanceKm: cumulativeKm, socPercent: soc });
  }

  const totalKWh = cumulativeWh / 1000;
  const consumedPercent = batteryWh > 0 ? (cumulativeWh / batteryWh) * 100 : 0;
  return {
    whPerKm: cumulativeKm > 0 ? cumulativeWh / cumulativeKm : 0,
    totalKWh,
    consumedPercent,
    remainingSocPercent: input.initialSocPercent - consumedPercent,
    minSocPercent: minSoc,
    waypoints,
  };
}
