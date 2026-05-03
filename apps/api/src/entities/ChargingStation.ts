import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Point } from "geojson";

@Entity()
export class ChargingStation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  provider: string;

  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4324,
  })
  location: Point;

  @Column("simple-array")
  plugTypes: string[];

  @Column("float")
  powerKW: number;

  @Column({ default: true })
  isAvailable: boolean;
}
