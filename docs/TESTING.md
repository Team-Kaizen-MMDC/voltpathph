# Testing Specifications & Quality Assurance 🧪📈

This document details the testing architecture, validation protocols, and user acceptance criteria for the Voltpath PH platform.

> **Status legend:** ✅ implemented today · 🔜 planned. The MVP scope is defined in [`MVP_SCOPE_AND_FEASIBILITY.md`](./MVP_SCOPE_AND_FEASIBILITY.md); the energy model is specified in [`ENERGY_MODEL.md`](./ENERGY_MODEL.md).

---

## 🧪 Testing Types Summary

| Testing Type              | Scope                                                                                                                                             | Target Frameworks                                                      | Success Criteria                                                                                              |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Unit Testing**          | Rule-based energy model (segment consumption, signed elevation energy, time-based auxiliary/AC load, per-segment SoC) and zod validation schemas. | Vitest (shared), Jest (api), Vitest + RTL (web)                        | ✅ Energy model covered (18 cases); 🔜 expand toward ≥ 90% coverage on core calculation modules.              |
| **Integration Testing**   | API flows: `/api/trips/optimize` (validation → energy → stations), `/api/stations/nearby` PostGIS queries, Supabase-JWT auth middleware.          | Jest, Supertest, Postman Collections                                   | Correct HTTP status codes (200, 400, 401, 404, 500) and schema-valid payloads. 🔜                             |
| **System Testing**        | Full monorepo stack (client → API → Supabase) on Railway staging.                                                                                 | Manual + 🔜 Playwright (web), `@testing-library/react-native` (mobile) | MVP functional requirements (FR-01, FR-02, FR-04–FR-09) verified on Android & iOS. FR-03 & FR-10 are Phase 2. |
| **Model Validation**      | Compare predicted vs actual SoC using the **Geely EX5 Em-i Max** test vehicle.                                                                    | Real-world road telemetry, Python/Node analysis scripts                | **MAPE ≤ 15%** and **RMSE ≤ 80 Wh/km**, reported per route archetype on held-out segments.                    |
| **UAT (User Acceptance)** | Researcher-driven scenarios (planning with low SoC, finding plugs, interpreting the SoC verdict).                                                 | SUS (System Usability Scale) Questionnaire                             | **Average SUS ≥ 70**; unanimous "easy to use" rating.                                                         |

---

## 📂 Testing Execution Commands

Run from the repository root:

```bash
# Run all tests across the Turborepo monorepo
npm run test

# Unit tests for the shared energy model (Vitest)
npx turbo run test --filter=@voltph/shared

# Backend API tests (Jest)
npx turbo run test --filter=api

# Web component/config tests (Vitest)
npx turbo run test --filter=web
```

---

## 🛠 Testing Framework Specifications

### 1. Unit Testing

- **Shared (energy model):** ✅ Written using **Vitest** in `packages/shared/src/energy.test.ts`. Verifies the rule-based model end-to-end with known input/output pairs: traffic/elevation/temperature weights, **signed elevation energy** (regen on descents), **time-based auxiliary/AC energy**, `segmentEnergyWh`, and `estimateRouteEnergy` (cumulative SoC, per-waypoint SoC, min-SoC, negative arrival SoC = "won't make it", zero-capacity guard).
- **Backend (api):** **Jest** + Supertest. Currently covers deployment/data-source configuration; 🔜 endpoint logic.
- **Frontend Web:** **Vitest** + React Testing Library.
- **Frontend Mobile:** 🔜 **Jest** + `@testing-library/react-native`.

> The model is rule-based (`E = Ebase × Wtraffic × Welevation × Wtemperature`); the force-based physics model is future work and is **not** under test. Calibration constants in `energy.ts` are placeholders until the test-drive regression replaces them.

### 2. Integration Testing

- Test suites live in `apps/api/test/` (Supertest).
- **Key scenarios:**
  1. `/api/trips/optimize` — submit valid/invalid `TripPlan` payloads (zod-validated); with `GOOGLE_MAPS_API_KEY` set it calls Google Directions/Elevation, otherwise a haversine estimate; returns a schema-valid `TripResult`. 🔜
  2. `/api/stations/nearby` — radius-based PostGIS `ST_DWithin` queries return stations within the search area. 🔜
  3. **Authentication** — the API does not expose register/login endpoints; **Supabase Auth** issues tokens and the API's `requireAuth` middleware verifies the Supabase JWT (`SUPABASE_JWT_SECRET`) on protected routes. Tests cover valid/expired/invalid-signature tokens and the dev bypass. 🔜

---

## 🚗 Model Validation Protocol (Road Test Drives)

To validate the rule-based energy/SoC model against real Philippine road and traffic conditions:

1. **Test Vehicle:** **Geely EX5 Em-i Max** (the single calibrated reference vehicle; baseline consumption and `REFERENCE_VEHICLE` parameters in `energy.ts` are placeholders pending calibration).
2. **Route Corridors:** the four archetypes — heavy traffic, mixed, elevation (Cavite/Tagaytay climbs), and highway (Skyway/SLEX).
3. **Telemetry:** log coordinates, timestamps, speed, distance, traffic level, road grade, ambient temperature, and start/end SoC per segment.
4. **Metrics:**
   - **MAPE:** $$\text{MAPE} = \frac{100\%}{n} \sum_{t=1}^{n} \left| \frac{\text{Actual}_t - \text{Predicted}_t}{\text{Actual}_t} \right| \le 15\%$$
   - **RMSE:** $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{t=1}^{n} (\text{Actual Wh/km}_t - \text{Predicted Wh/km}_t)^2} \le 80 \text{ Wh/km}$$
   - Report **per route archetype** on **held-out** segments (not the rows used to fit the weights).
   - _Recalibration:_ fit the multiplicative weights via **log-linear regression** (`ln(E) = ln(Ebase) + Σ βᵢ·xᵢ` ⇒ `Wᵢ = exp(βᵢ·xᵢ)`); if thresholds are exceeded, re-run on an expanded dataset and recalibrate.

---

## 📋 User Acceptance Testing (UAT)

Conducted internally by developers/evaluators:

- **Predefined Scenarios:**
  - _Scenario A:_ Plan Manila → Tagaytay with an initial SoC of 35%, verifying the SoC prediction and the reachability verdict, and that charging stations are surfaced along the route.
  - _Scenario B:_ Identify and filter charging stations by CCS2 plug type on the mobile map.
  - _Scenario C (Phase 2):_ Submit/view a charger status report (crowdsourced reporting, FR-10) — deferred to Phase 2.
- **System Usability Scale (SUS):** evaluators complete the 10-item questionnaire; average must exceed **70** to pass.
