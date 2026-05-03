import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import evModelRoutes from "./routes/evModels";
import stationRoutes from "./routes/stations";
import tripRoutes from "./routes/trips";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/ev-models", evModelRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trips", tripRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VoltPH API" });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(port, () => {
      console.log(`VoltPH API listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
