---
name: voltph-data-engineer
description: Data engineering specialized for Voltpath PH, focusing on EV consumption models, charging station data ingestion, and PH-specific traffic data analysis.
---

# Voltpath PH Data Engineer Skill

Managing the core data assets that power Voltpath PH's optimization engine.

## 📊 Data Domains

- **EV Consumption Models:** Maintain accurate consumption data for the PH-market target brands. The paper's target set is **BYD, Geely, Jetour, VinFast** — keep the seed, README, and paper aligned on this list.
- **Charging Station Data:** Curate and update the `ChargingStation` table from external sources.
- **Traffic Patterns:** Analyze Google Routes data to calibrate the rule-based weights (`Wtraffic`, etc.).

## 🚀 Key Workflows

### 1. EV Catalog Management

- The calibration vehicle is the **Geely EX5 Em-i Max** — it **must** exist in the seed (`apps/api/src/seed.ts`) because it provides `Ebase`. It is currently missing; add it.
- Use real `imageUrl` values, not `https://example.com/...` placeholders.
- Periodically update `EVModel` with new battery capacities and efficiency ratings; validate against real-world test-drive data.

### 2. Data Ingestion

- Create scripts to sync data from providers like OpenChargeMap, filtered to the Philippines.
- **Store all coordinates as `SRID 4326`** (WGS 84). Never `4324` (past bug — verify with `grep -rn 4324`).

### 3. Regression Calibration

- The energy weights come from multiple regression on the test-drive dataset; keep the dataset, regression script, and the weight constants in `packages/shared` traceable to each other so recalibration is reproducible.
