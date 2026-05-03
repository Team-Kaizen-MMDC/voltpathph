import { AppDataSource } from "./data-source";
import { EVModel } from "./entities/EVModel";

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const evModelRepository = AppDataSource.getRepository(EVModel);

    const models = [
      {
        make: "BYD",
        model: "Atto 3 Premium",
        batteryCapacityKWh: 60.48,
        averageConsumptionKWhPerKm: 0.126,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/byd-atto3.jpg",
      },
      {
        make: "BYD",
        model: "Dolphin",
        batteryCapacityKWh: 44.9,
        averageConsumptionKWhPerKm: 0.111,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/byd-dolphin.jpg",
      },
      {
        make: "Jetour",
        model: "Ice Cream EV",
        batteryCapacityKWh: 13.9,
        averageConsumptionKWhPerKm: 0.081,
        plugTypes: ["Type 2"],
        imageUrl: "https://example.com/jetour-icecream.jpg",
      },
      {
        make: "VinFast",
        model: "VF 5 Plus",
        batteryCapacityKWh: 37.23,
        averageConsumptionKWhPerKm: 0.114,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/vinfast-vf5.jpg",
      },
      {
        make: "VinFast",
        model: "VF 3",
        batteryCapacityKWh: 18.64,
        averageConsumptionKWhPerKm: 0.088,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/vinfast-vf3.jpg",
      },
      {
        make: "MG",
        model: "MG4 Lux",
        batteryCapacityKWh: 64.0,
        averageConsumptionKWhPerKm: 0.147,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/mg4.jpg",
      },
      {
        make: "Nissan",
        model: "Leaf",
        batteryCapacityKWh: 40.0,
        averageConsumptionKWhPerKm: 0.128,
        plugTypes: ["Type 2", "CHAdeMO"],
        imageUrl: "https://example.com/nissan-leaf.jpg",
      },
      {
        make: "Hyundai",
        model: "Ioniq 5 Long Range",
        batteryCapacityKWh: 84.0,
        averageConsumptionKWhPerKm: 0.174,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/hyundai-ioniq5.jpg",
      },
      {
        make: "Kia",
        model: "EV6",
        batteryCapacityKWh: 77.4,
        averageConsumptionKWhPerKm: 0.146,
        plugTypes: ["Type 2", "CCS2"],
        imageUrl: "https://example.com/kia-ev6.jpg",
      },
    ];

    for (const modelData of models) {
      const existing = await evModelRepository.findOneBy({
        make: modelData.make,
        model: modelData.model,
      });

      if (!existing) {
        const model = evModelRepository.create(modelData);
        await evModelRepository.save(model);
        console.log(`Seeded model: ${modelData.make} ${modelData.model}`);
      } else {
        console.log(`Model already exists: ${modelData.make} ${modelData.model}`);
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
