import { Router } from "express";
import { AppDataSource } from "../data-source";
import { EVModel } from "../entities/EVModel";
import { ChargingStation } from "../entities/ChargingStation";
import {
  TripPlanSchema,
  estimateTripEnergy,
  type ChargingStation as SharedChargingStation,
  type TripResult,
} from "@voltph/shared";
import { getRouteData, type LatLng } from "../services/maps";
import { requireAuth } from "../middleware/auth";

const router = Router();

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** SoC below which the trip needs a charging stop recommendation. */
const LOW_SOC_THRESHOLD = 20;

async function findStationsNearby(
  point: LatLng,
  radiusMeters = 10000,
  limit = 5,
): Promise<SharedChargingStation[]> {
  try {
    const rows = await AppDataSource.getRepository(ChargingStation)
      .createQueryBuilder("s")
      .select("s.id", "id")
      .addSelect("s.name", "name")
      .addSelect("s.provider", "provider")
      .addSelect("s.plugTypes", "plugTypes")
      .addSelect("s.powerKW", "powerKW")
      .addSelect("s.isAvailable", "isAvailable")
      .addSelect("ST_Y(s.location::geometry)", "latitude")
      .addSelect("ST_X(s.location::geometry)", "longitude")
      .where(
        "ST_DWithin(s.location, ST_SetSRID(ST_Point(:lng, :lat), 4326), :radius)",
        { lng: point.lng, lat: point.lat, radius: radiusMeters },
      )
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      plugTypes:
        typeof r.plugTypes === "string"
          ? r.plugTypes.split(",").filter(Boolean)
          : (r.plugTypes ?? []),
      powerKW: Number(r.powerKW),
      isAvailable: r.isAvailable,
    }));
  } catch {
    // Charging-station table may be empty or unavailable; degrade gracefully.
    return [];
  }
}

router.post("/optimize", requireAuth, async (req, res, next) => {
  const parsed = TripPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid trip plan", issues: parsed.error.issues });
  }
  const plan = parsed.data;

  try {
    const evModel = await AppDataSource.getRepository(EVModel).findOneBy({
      id: plan.evModelId,
    });
    if (!evModel) {
      return res.status(404).json({ message: "EV model not found" });
    }

    const route = await getRouteData(plan.origin, plan.destination);

    const energy = estimateTripEnergy({
      distanceKm: route.distanceKm,
      baseConsumptionKWhPerKm: evModel.averageConsumptionKWhPerKm,
      batteryCapacityKWh: evModel.batteryCapacityKWh,
      initialSocPercent: plan.initialBatteryPercentage,
      conditions: {
        trafficLevel: route.trafficLevel,
        gradePercent: route.avgGradePercent,
      },
    });

    const recommendedChargingStops =
      energy.remainingSocPercent < LOW_SOC_THRESHOLD
        ? await findStationsNearby(plan.destination)
        : [];

    const result: TripResult = {
      totalDistanceKm: round(route.distanceKm, 1),
      totalDurationMin: round(route.durationMin, 0),
      estimatedBatteryConsumptionKWh: round(energy.totalKWh, 2),
      remainingBatteryPercentage: round(energy.remainingSocPercent, 1),
      recommendedChargingStops,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
