# Testing Specifications & Quality Assurance 🧪📈

This document details the testing architecture, validation protocols, and user acceptance criteria for the VoltPH platform.

---

## 🧪 Testing Types Summary

| Testing Type | Scope | Target Frameworks | Success Criteria |
| :--- | :--- | :--- | :--- |
| **Unit Testing** | Physics math engine, SoC depletion calculator, query builders, and zod validation schemas. | Jest (Backend / Shared), Vitest (Web) | $\ge 90\%$ code coverage on core calculation modules; all tests pass. |
| **Integration Testing** | Dynamic API flows: optimization coordinates lookup, station buffer calculations, Google Maps SDK mapping, and Auth flows. | Jest, Supertest, Postman Collections | Correct HTTP status codes (200, 201, 400, 401, 404, 500) and schemas returned. |
| **System Testing** | Full monorepo stack verification (client-to-API-to-database) on Railway staging environment. | React Native Component Testing, Playwright (Web) | All functional requirements (FR-01 to FR-08) verified on Android & iOS. |
| **Model Validation** | Compare predicted energy usage against actual SoC logs using the **Geely EX5 Em-i Max** test vehicle. | Real-world road telemetry, Python/Node data analysis scripts | **MAPE $\le 15\%$** and **RMSE $\le 80$ Wh/km** across Metro Manila & Cavite routes. |
| **UAT (User Acceptance)** | Researcher-driven scenario assessments (e.g., planning with low SoC, finding plugs, interpreting ranges). | SUS (System Usability Scale) Questionnaire | **Average SUS score $\ge 70$** across evaluators; unanimous "easy to use" rating. |

---

## 📂 Testing Execution Commands

Use these commands from the root directory to execute automated checks:

```bash
# Run all tests in the Turborepo monorepo
npm run test

# Run unit tests only on shared package logic (e.g. physics algorithms)
npx turbo run test --filter=shared

# Run backend API integration tests
npx turbo run test --filter=api

# Run web vitest component checks
npx turbo run test --filter=web
```

---

## 🛠 Testing Framework Specifications

### 1. Unit Testing
- **Backend / Shared:** Written using **Jest**. Focuses on the math engine in `packages/shared/src/physics.ts` to verify rolling resistance, drag computations, and auxiliary load additions.
- **Frontend Web:** Powered by **Vitest** and **React Testing Library** for verifying UI component rendering and hook behaviors.
- **Frontend Mobile:** Verified using **Jest** and `@testing-library/react-native`.

### 2. Integration Testing
- Test suites are configured in `apps/api/test/` using **Supertest** to mock HTTP operations.
- **Key Scenarios Checked:**
  1. `/api/trips/optimize`: Submitting valid and invalid `TripPlan` payloads, ensuring it coordinates with the mocked Google Maps SDK and returns valid `TripResult` schemas.
  2. `/api/stations/nearby`: Checking radius-based geospatial queries, verifying that PostGIS retrieves stations inside the spatial search parameters.
  3. `/api/auth/register` & `/api/auth/login`: Verifying registration validation, duplicate email guards, password hashing, and token signature validation.

---

## 🚗 Model Validation Protocol (Road Test Drives)

To validate the EV range prediction engine against real Philippine road and traffic conditions:
1. **Test Vehicle:** **Geely EX5 Em-i Max** (Curb weight: ~1600kg, Drag Coefficient $C_d$: 0.26).
2. **Test Route Corridors:** Metro Manila urban streets (stop-and-go congestion) and elevation climbs in Cavite/Tagaytay.
3. **Telemetry Tracking:** Drivers log coordinates, timestamps, travel speed, and real-time battery State-of-Charge (SoC) percentages at specific markers.
4. **Calculations Validation:**
   - **Mean Absolute Percentage Error (MAPE):**
     $$\text{MAPE} = \frac{100\%}{n} \sum_{t=1}^{n} \left| \frac{\text{Actual SoC}_t - \text{Predicted SoC}_t}{\text{Actual SoC}_t} \right| \le 15\%$$
   - **Root Mean Square Error (RMSE):**
     $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{t=1}^{n} (\text{Actual Wh/km}_t - \text{Predicted Wh/km}_t)^2} \le 80 \text{ Wh/km}$$
   - *Recalibration Procedure:* If thresholds are exceeded, the physics weight factors (traffic drag multipliers, AC temperature load constants) will be re-run against the expanded telemetry dataset using linear regression.

---

## 📋 User Acceptance Testing (UAT)
Conducted internally by developers/evaluators assessing specific usability parameters:
- **Predefined Scenarios:**
  - *Scenario A:* Plan a trip from Manila to Tagaytay with an initial SoC of $35\%$, verifying that the system recommends charging stops along the route.
  - *Scenario B:* Identify and filter charging stations by CCS2 plug type on the mobile map sheet.
  - *Scenario C:* View and report a broken charger status at a simulated station.
- **System Usability Scale (SUS):** Evaluators complete the standard 10-item Likert scale questionnaire. The average rating must exceed **70** to pass UAT boundaries.
