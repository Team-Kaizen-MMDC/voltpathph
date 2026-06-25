export interface EVModel {
  id: string;
  make: string;
  model: string;
  batteryCapacityKWh: number;
  averageConsumptionKWhPerKm: number;
  plugTypes: string[];
  imageUrl?: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  provider: string;
  plugTypes: string[];
  powerKW: number;
  isAvailable: boolean;
}

export interface TripPlan {
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  evModelId: string;
  initialBatteryPercentage: number;
}

export interface TripResult {
  totalDistanceKm: number;
  totalDurationMin: number;
  estimatedBatteryConsumptionKWh: number;
  remainingBatteryPercentage: number;
  recommendedChargingStops: ChargingStation[];
}

export * from "./validation";
export * from "./energy";
