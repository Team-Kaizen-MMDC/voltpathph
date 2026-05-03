import { Router } from "express";
import { AppDataSource } from "../data-source";
import { EVModel } from "../entities/EVModel";
import { TripPlan, TripResult } from "@voltph/shared";

const router = Router();

router.post("/optimize", async (req, res) => {
  const plan: TripPlan = req.body;

  try {
    const evModel = await AppDataSource.getRepository(EVModel).findOneBy({ id: plan.evModelId });
    if (!evModel) {
      return res.status(404).json({ message: "EV model not found" });
    }

    // Mocked implementation for now
    // In a real app, this would call Google Routes API and perform battery calculations
    const mockResult: TripResult = {
      totalDistanceKm: 120.5,
      totalDurationMin: 150,
      estimatedBatteryConsumptionKWh: 18.2,
      remainingBatteryPercentage: plan.initialBatteryPercentage - (18.2 / evModel.batteryCapacityKWh * 100),
      recommendedChargingStops: []
    };

    res.json(mockResult);
  } catch (error) {
    res.status(500).json({ message: "Error optimizing trip", error });
  }
});

export default router;
