import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class EVModel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  make!: string;

  @Column()
  model!: string;

  @Column("float")
  batteryCapacityKWh!: number;

  @Column("float")
  averageConsumptionKWhPerKm!: number;

  @Column("simple-array")
  plugTypes!: string[];

  @Column({ nullable: true })
  imageUrl?: string;
}
