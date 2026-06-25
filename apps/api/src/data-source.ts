import "reflect-metadata";
import { DataSource } from "typeorm";
import { EVModel } from "./entities/EVModel";
import { ChargingStation } from "./entities/ChargingStation";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: !process.env.DATABASE_URL
    ? process.env.DB_HOST || "localhost"
    : undefined,
  port: !process.env.DATABASE_URL
    ? parseInt(process.env.DB_PORT || "5432")
    : undefined,
  username: !process.env.DATABASE_URL
    ? process.env.DB_USERNAME || "postgres"
    : undefined,
  password: !process.env.DATABASE_URL
    ? process.env.DB_PASSWORD || "password"
    : undefined,
  database: !process.env.DATABASE_URL
    ? process.env.DB_DATABASE || "voltph"
    : undefined,
  // Auto-sync schema in development only. In production set NODE_ENV=production
  // and apply migrations explicitly (npm run migration:run).
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: [EVModel, ChargingStation],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [],
});
