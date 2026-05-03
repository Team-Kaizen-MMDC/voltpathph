---
name: voltph-data-engineer
description: Data engineering specialized for VoltPH, focusing on EV consumption models, charging station data ingestion, and PH-specific traffic data analysis.
---

# VoltPH Data Engineer Skill

Managing the core data assets that power VoltPH's optimization engine.

## 📊 Data Domains
- **EV Consumption Models:** Maintaining accurate kWh/km data for PH-available brands (BYD, Vinfast, etc.).
- **Charging Station Data:** Curating and updating the `ChargingStation` table from external sources.
- **Traffic Patterns:** Analyzing data from Google Routes to improve battery prediction accuracy.

## 🚀 Key Workflows

### 1. EV Catalog Management
- Periodically update the `EVModel` table with new battery capacities and efficiency ratings.
- Validate consumption formulas against real-world test data from the PH market.

### 2. Data Ingestion
- Create scripts to sync data from providers like OpenChargeMap, filtering specifically for the Philippines.
- Ensure all coordinates are correctly transformed to `SRID 4324`.
