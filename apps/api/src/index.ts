import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import evModelRoutes from "./routes/evModels";
import stationRoutes from "./routes/stations";
import tripRoutes from "./routes/trips";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Restrict CORS to configured web origins in production; reflect origin in dev.
const allowedOrigins = process.env.WEB_ORIGIN?.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length ? allowedOrigins : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/ev-models", evModelRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trips", tripRoutes);

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
    app.listen(port, () => {
      console.log(`VoltPath PH API listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
    process.exit(1);
  });
