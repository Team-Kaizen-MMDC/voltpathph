import { describe, it, expect } from "vitest";
import {
  kWhPerKmToWhPerKm,
  trafficWeight,
  elevationWeight,
  temperatureWeight,
  segmentConsumptionWhPerKm,
  estimateTripEnergy,
  elevationEnergyWh,
  auxiliaryPowerW,
  auxiliaryEnergyWh,
  segmentEnergyWh,
  estimateRouteEnergy,
  REFERENCE_VEHICLE,
  type RouteSegment,
} from "./energy";

// Reference constants used to derive the expected values below:
//   mass 1900 kg, g 9.81, η_drive 0.90, η_regen 0.65,
//   baseAux 300 W, acW/°C 120, acComfort 24 °C, maxAux 3000 W, baseline 30 °C.

describe("units & Tier-1 weights", () => {
  it("converts kWh/km to Wh/km", () => {
    expect(kWhPerKmToWhPerKm(0.15)).toBe(150);
  });

  it("traffic weights match the calibration table (default = light)", () => {
    expect(trafficWeight("free")).toBe(0.95);
    expect(trafficWeight("light")).toBe(1.0);
    expect(trafficWeight("moderate")).toBe(1.15);
    expect(trafficWeight("heavy")).toBe(1.35);
    expect(trafficWeight()).toBe(1.0);
  });

  it("elevation weight rises uphill, falls downhill, and clamps", () => {
    expect(elevationWeight(0)).toBeCloseTo(1.0, 6);
    expect(elevationWeight(5)).toBeCloseTo(1.2, 6);
    expect(elevationWeight(10)).toBeCloseTo(1.4, 6);
    expect(elevationWeight(-10)).toBeCloseTo(0.8, 6); // floor
    expect(elevationWeight(100)).toBeCloseTo(1.6, 6); // cap
  });

  it("temperature weight is 1.0 at comfort, rises with heat, and clamps", () => {
    expect(temperatureWeight(24)).toBeCloseTo(1.0, 6);
    expect(temperatureWeight(30)).toBeCloseTo(1.072, 6);
    expect(temperatureWeight(34)).toBeCloseTo(1.12, 6);
    expect(temperatureWeight(100)).toBeCloseTo(1.3, 6); // cap
  });

  it("Tier-1 segment consumption multiplies the factors", () => {
    // 150 × 1.35 × 1.4 × 1.12 = 317.52 Wh/km
    expect(
      segmentConsumptionWhPerKm(150, {
        trafficLevel: "heavy",
        gradePercent: 10,
        temperatureC: 34,
      }),
    ).toBeCloseTo(317.52, 4);
  });

  it("Tier-1 estimateTripEnergy computes SoC drop", () => {
    const r = estimateTripEnergy({
      distanceKm: 100,
      baseConsumptionKWhPerKm: 0.15,
      batteryCapacityKWh: 60,
      initialSocPercent: 100,
      conditions: { trafficLevel: "light", gradePercent: 0, temperatureC: 30 },
    });
    expect(r.whPerKm).toBeCloseTo(160.8, 4); // 150 × 1.072
    expect(r.totalKWh).toBeCloseTo(16.08, 4);
    expect(r.remainingSocPercent).toBeCloseTo(73.2, 4); // 100 − 26.8
  });
});

describe("Tier-2 elevation (signed potential energy + regen)", () => {
  it("+100 m climb costs (m·g·Δh/3600)/η_drive Wh", () => {
    // 1900·9.81·100/3600 = 517.75 ; /0.9 = 575.2778
    expect(elevationEnergyWh(100)).toBeCloseTo(575.2778, 3);
  });

  it("−200 m descent recovers a fraction (negative Wh)", () => {
    // 1900·9.81·200/3600 = 1035.5 ; ×0.65 = 673.075 ; negative
    expect(elevationEnergyWh(-200)).toBeCloseTo(-673.075, 3);
  });

  it("flat segment costs nothing", () => {
    expect(elevationEnergyWh(0)).toBe(0);
  });
});

describe("Tier-2 auxiliary (time-based AC)", () => {
  it("power is base load below comfort, rises with heat, and caps", () => {
    expect(auxiliaryPowerW(20)).toBe(300); // below comfort → base only
    expect(auxiliaryPowerW(24)).toBe(300);
    expect(auxiliaryPowerW(30)).toBe(1020); // 300 + 6×120
    expect(auxiliaryPowerW(34)).toBe(1500); // 300 + 10×120
    expect(auxiliaryPowerW(100)).toBe(REFERENCE_VEHICLE.maxAuxiliaryW); // cap 3000
  });

  it("energy scales with time, not distance", () => {
    expect(auxiliaryEnergyWh(30, 60)).toBeCloseTo(1020, 6); // 1020 W × 1 h
    expect(auxiliaryEnergyWh(24, 30)).toBeCloseTo(150, 6); // 300 W × 0.5 h
  });
});

describe("Tier-2 segmentEnergyWh (drive + elevation + aux)", () => {
  it("flat, light, comfort: drive + aux only", () => {
    const seg: RouteSegment = {
      distanceKm: 10,
      durationMin: 60,
      trafficLevel: "light",
      deltaElevationM: 0,
      temperatureC: 24,
    };
    // 150×10×1.0 + 0 + 300×1 = 1800
    expect(segmentEnergyWh(150, seg)).toBeCloseTo(1800, 4);
  });

  it("heavy + uphill + hot stacks all three terms", () => {
    const seg: RouteSegment = {
      distanceKm: 10,
      durationMin: 120,
      trafficLevel: "heavy",
      deltaElevationM: 200,
      temperatureC: 34,
    };
    // drive 150×10×1.35=2025 ; elev 1150.5556 ; aux 1500W×2h=3000 → 6175.5556
    expect(segmentEnergyWh(150, seg)).toBeCloseTo(6175.5556, 3);
  });

  it("downhill regen reduces segment energy", () => {
    const seg: RouteSegment = {
      distanceKm: 10,
      durationMin: 30,
      trafficLevel: "free",
      deltaElevationM: -200,
      temperatureC: 24,
    };
    // drive 1425 − 673.075 + aux 150 = 901.925
    expect(segmentEnergyWh(150, seg)).toBeCloseTo(901.925, 3);
  });

  it("derives elevation from gradePercent when deltaElevationM is absent", () => {
    const withGrade: RouteSegment = {
      distanceKm: 10,
      durationMin: 60,
      trafficLevel: "light",
      gradePercent: 1, // 1% of 10 km = 100 m climb
      temperatureC: 24,
    };
    const withDelta: RouteSegment = {
      ...withGrade,
      gradePercent: undefined,
      deltaElevationM: 100,
    };
    expect(segmentEnergyWh(150, withGrade)).toBeCloseTo(
      segmentEnergyWh(150, withDelta),
      6,
    );
  });
});

describe("Tier-2 estimateRouteEnergy (per-segment SoC accumulation)", () => {
  const segments: RouteSegment[] = [
    {
      distanceKm: 10,
      durationMin: 60,
      trafficLevel: "light",
      deltaElevationM: 0,
      temperatureC: 24,
    }, // 1800 Wh
    {
      distanceKm: 10,
      durationMin: 30,
      trafficLevel: "free",
      deltaElevationM: -200,
      temperatureC: 24,
    }, // 901.925 Wh
  ];

  it("accumulates energy, SoC, waypoints, and min SoC", () => {
    const r = estimateRouteEnergy({
      segments,
      baseConsumptionKWhPerKm: 0.15,
      batteryCapacityKWh: 60,
      initialSocPercent: 80,
    });
    expect(r.totalKWh).toBeCloseTo(2.701925, 5); // (1800 + 901.925)/1000
    expect(r.whPerKm).toBeCloseTo(135.09625, 4); // 2701.925 / 20 km
    expect(r.remainingSocPercent).toBeCloseTo(75.496792, 4);
    expect(r.waypoints).toHaveLength(3); // start + 2 segments
    expect(r.waypoints[0]).toEqual({ distanceKm: 0, socPercent: 80 });
    expect(r.waypoints[1].socPercent).toBeCloseTo(77, 4); // 80 − 3
    expect(r.minSocPercent).toBeCloseTo(75.496792, 4);
  });

  it("represents 'won't make it' as a negative arrival SoC", () => {
    const r = estimateRouteEnergy({
      segments,
      baseConsumptionKWhPerKm: 0.15,
      batteryCapacityKWh: 60,
      initialSocPercent: 3, // not enough
    });
    expect(r.remainingSocPercent).toBeLessThan(0);
  });

  it("guards against a zero-capacity battery", () => {
    const r = estimateRouteEnergy({
      segments,
      baseConsumptionKWhPerKm: 0.15,
      batteryCapacityKWh: 0,
      initialSocPercent: 50,
    });
    expect(r.remainingSocPercent).toBe(50);
    expect(r.consumedPercent).toBe(0);
  });
});
