import type { ChargingStation, TripPlan } from "@voltph/shared";

/** Route params for the root native-stack navigator. */
export type RootStackParamList = {
  TripPlanner: undefined;
  Result: { plan: TripPlan; modelName: string };
  StationDetail: { station: ChargingStation };
};
