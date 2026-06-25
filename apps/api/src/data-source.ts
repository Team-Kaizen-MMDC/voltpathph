import "reflect-metadata";
import { DataSource } from "typeorm";
import { EVModel } from "./entities/EVModel";
import { ChargingStation } from "./entities/ChargingStation";
import { config } from "./config";

const { db } = config;

export const AppDataSource = new DataSource({
  type: "postgres",
  // Prefer the full connection string; fall back to discrete vars for local dev.
  url: db.url,
  host: db.url ? undefined : db.host,
  port: db.url ? undefined : db.port,
  username: db.url ? undefined : db.username,
  password: db.url ? undefined : db.password,
  database: db.url ? undefined : db.database,
  // Auto-sync schema in development only; production uses explicit migrations
  // (npm run migration:run).
  synchronize: !config.isProduction,
  logging: false,
  entities: [EVModel, ChargingStation],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [],
});
