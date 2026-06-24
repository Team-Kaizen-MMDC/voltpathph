---
name: voltph-ev-physics
description: EV energy consumption modeling for Voltpath PH. The CANONICAL model is the paper's rule-based multiplicative formula (E = Ebase × Wtraffic × Welevation × Wtemperature). Use when developing or refining the battery/SoC prediction engine. A physics force-model is documented at the end as future work only.
---

# Voltpath PH EV Energy Consumption Skill

Guidance for estimating EV battery consumption and State-of-Charge (SoC) along a route.

> **Canonical model decision:** The Capstone paper adopts a **rule-based multiplicative** model and explicitly argues _against_ heavy physics/ML for a mobile, explainable, resource-constrained deployment (RRL §"Rule-Based and Coefficient Models"). Implement the rule-based model. The physics force-model in the appendix is **future/alternative work** — never present it as the implemented approach in code, docs, or the paper.

## ⚡ The Canonical Model (implement this)

For each route segment:

```
E = Ebase × Wtraffic × Welevation × Wtemperature
```

- **E** — estimated consumption for the segment (Wh/km). Keep one unit project-wide. The paper uses **Wh/km**; the `EVModel.averageConsumptionKWhPerKm` column is kWh/km — convert explicitly (`1 kWh/km = 1000 Wh/km`) and document it.
- **Ebase** — baseline consumption from the selected `EVModel` (manufacturer spec). Calibration vehicle: **Geely EX5 Em-i Max**.
- **Wtraffic** — congestion weight (free / light / moderate / heavy), centered on 1.0 at light traffic.
- **Welevation** — terrain weight from net grade per km (Google Elevation API): >1.0 uphill, <1.0 net downhill (regen recovery).
- **Wtemperature** — ambient-temperature / AC-load weight: >1.0 in tropical heat.

Weights are **multiplicative** so compounding adverse conditions (heavy traffic _and_ uphill) stack realistically. They are derived from **multiple regression** on the PH test-drive dataset, each centered at 1.0 under baseline conditions (light traffic, flat terrain, moderate temperature).

### Segment SoC depletion

```
segmentWh     = E × segmentDistanceKm
batteryWh     = EVModel.batteryCapacityKWh × 1000
deltaSoC%     = (segmentWh / batteryWh) × 100
remainingSoC% = previousSoC% − deltaSoC%
```

Compute per segment; surface predicted SoC at each waypoint.

## ✅ Implementation notes

- Put the formula and weight tables in `packages/shared` (single source of truth for API + clients). The paper/docs reference `packages/shared/src/physics.ts`; create that module (rename to `energy.ts` if "physics" no longer fits) — **it does not exist yet**.
- **Test-first:** write unit tests with known input/output pairs from the test-drive dataset before wiring the endpoint (see `voltph-test-engineer`).
- Keep weights in a constants/config object so regression recalibration is a data change, not a code change.
- Validate against `NFR-01` (MAPE ≤ 15%) and `NFR-02` (RMSE ≤ 80 Wh/km).

## 🇵🇭 Philippine factors captured by the weights

- **Traffic:** stop-and-go raises consumption via repeated accel/decel and longer AC runtime → higher `Wtraffic`.
- **Elevation:** Manila ↔ Tagaytay/Antipolo/Cavite climbs → higher `Welevation`; descents recover some energy.
- **Temperature:** sustained 28–35 °C → continuous AC load → higher `Wtemperature`.

---

## 📎 Appendix — Physics force-model (FUTURE WORK ONLY)

Do **not** implement as the primary model or document as built. It requires `EVModel` fields that do not currently exist (`drag_coefficient`, `frontal_area_sqm`, `mass_kg`, `rolling_resistance_coefficient`); do not add those columns to docs/schema unless this model is actually adopted.

`F_total = F_roll + F_drag + F_gravity + F_accel`

- Rolling: `F_roll = Cr · m · g · cos(θ)`
- Drag: `F_drag = ½ · ρ · Cd · A · v²` (ρ ≈ 1.18 kg/m³ at ~30 °C)
- Gravity: `F_gravity = m · g · sin(θ)`
- Inertia: `F_accel = m · a`

Convert wheel energy to battery energy via propulsion efficiency (~0.85–0.90), apply regen efficiency (~0.60–0.70) on negative `F_total`, add auxiliary energy `E_aux = P_aux · t` (P_aux ≈ 1.0–2.5 kW). More granular, but contradicts the paper's rationale and is harder to calibrate/explain — hence future work.
