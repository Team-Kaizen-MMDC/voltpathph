import { Router } from "express";
import { AppDataSource } from "../data-source";
import { EVModel } from "../entities/EVModel";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const evModels = await AppDataSource.getRepository(EVModel).find();
    res.json(evModels);
  } catch {
    res.status(500).json({ message: "Error fetching EV models" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const evModel = await AppDataSource.getRepository(EVModel).findOneBy({
      id: req.params.id,
    });
    if (!evModel) {
      return res.status(404).json({ message: "EV model not found" });
    }
    res.json(evModel);
  } catch {
    res.status(500).json({ message: "Error fetching EV model" });
  }
});

export default router;
