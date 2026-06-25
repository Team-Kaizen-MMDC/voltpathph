import { Router } from "express";
import { searchPlaces } from "../services/places";

const router = Router();

// GET /api/places/search?q=...  → PlaceResult[]
router.get("/search", async (req, res, next) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  if (!q.trim()) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }
  try {
    res.json(await searchPlaces(q));
  } catch (error) {
    next(error);
  }
});

export default router;
