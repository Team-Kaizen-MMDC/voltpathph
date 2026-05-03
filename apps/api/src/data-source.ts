import "reflect-metadata";
import { DataSource } from "typeorm";
import { EVModel } from "./entities/EVModel";
import { ChargingStation } from "./entities/ChargingStation";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "voltph",
  synchronize: true, // Be careful with this in production
  logging: false,
  entities: [EVModel, ChargingStation],
  migrations: [],
  subscribers: [],
});
