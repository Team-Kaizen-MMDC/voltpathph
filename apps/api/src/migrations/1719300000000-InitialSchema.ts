import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial schema for the implemented entities (EVModel, ChargingStation).
 *
 * This is hand-authored to match the current entities and to enable the required
 * PostGIS / uuid-ossp extensions. After connecting a real database (Supabase),
 * regenerate subsequent migrations with `npm run migration:generate` so column
 * definitions stay in sync with the TypeORM entities.
 *
 * Note: the additional tables documented in docs/DATABASE.md (user, user_vehicle,
 * trip, trip_waypoint, charger_connector, station_report) are not yet implemented
 * as entities and are therefore intentionally not created here.
 */
export class InitialSchema1719300000000 implements MigrationInterface {
  name = "InitialSchema1719300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await queryRunner.query(`
      CREATE TABLE "ev_model" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "make" character varying NOT NULL,
        "model" character varying NOT NULL,
        "batteryCapacityKWh" double precision NOT NULL,
        "averageConsumptionKWhPerKm" double precision NOT NULL,
        "plugTypes" text NOT NULL,
        "imageUrl" character varying,
        CONSTRAINT "PK_ev_model" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "charging_station" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "provider" character varying NOT NULL,
        "location" geography(Point, 4326) NOT NULL,
        "plugTypes" text NOT NULL,
        "powerKW" double precision NOT NULL,
        "isAvailable" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_charging_station" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_charging_station_location" ON "charging_station" USING GiST ("location");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_charging_station_location";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "charging_station";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ev_model";`);
  }
}
