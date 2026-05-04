import { z } from 'zod';

export const TripPlanSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }),
  evModelId: z.string().uuid(),
  initialBatteryPercentage: z.number().min(0).max(100)
});

export type TripPlanZod = z.infer<typeof TripPlanSchema>;
