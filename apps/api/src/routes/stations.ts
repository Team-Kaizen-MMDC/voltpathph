import { Router } from "express";
import { AppDataSource } from "../data-source";
import { ChargingStation } from "../entities/ChargingStation";

const router = Router();

router.get("/nearby", async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query; // radius in meters

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required" });
  }

  try {
    const stations = await AppDataSource.getRepository(ChargingStation)
      .createQueryBuilder("station")
      .where(
        "ST_DWithin(station.location, ST_SetSRID(ST_Point(:lng, :lat), 4326), :radius)",
        {
          lng: parseFloat(lng as string),
          lat: parseFloat(lat as string),
          radius: parseInt(radius as string),
        },
      )
      .getMany();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nearby stations", error });
  }
});

export default router;
