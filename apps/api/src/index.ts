import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { config } from "./config";
import { AppDataSource } from "./data-source";
import evModelRoutes from "./routes/evModels";
import stationRoutes from "./routes/stations";
import tripRoutes from "./routes/trips";
import placeRoutes from "./routes/places";

const app = express();

// Restrict CORS to configured web origins in production; reflect origin in dev.
app.use(cors({ origin: config.webOrigins.length ? config.webOrigins : true }));
app.use(express.json({ limit: config.jsonBodyLimit }));

app.use("/api/ev-models", evModelRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/places", placeRoutes);

app.get("/health", (_req, res) => {
  const dbUp = AppDataSource.isInitialized;
  res.json({
    status: dbUp ? "ok" : "degraded",
    service: "VoltPath PH API",
    database: dbUp ? "up" : "down",
  });
});

// Central error handler — never leak raw error objects or stack traces to clients.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(config.port, () => {
      console.log(
        `VoltPath PH API listening at http://localhost:${config.port}`,
      );
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
    process.exit(1);
  });
