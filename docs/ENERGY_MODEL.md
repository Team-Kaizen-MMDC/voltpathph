# Voltpath PH — Energy Consumption & SoC Model

> The scientific core of Voltpath PH: how the app predicts EV energy use and
> State-of-Charge (SoC) for Philippine routes, how the model is calibrated from
> test-drive data, and how it is validated. Implemented in
> `packages/shared/src/energy.ts`; consumed by the API's `/api/trips/optimize`.

---

## 1. Headline model

The public-facing equation (used in the paper) is the rule-based multiplicative model:

```
E = Ebase × Wtraffic × Welevation × Wtemperature      (Wh/km, per route segment)
```

| Symbol         | Meaning                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------- |
| `E`            | Estimated consumption for a segment (Wh/km)                                               |
| `Ebase`        | Baseline consumption from the EV spec (Wh/km) — Geely EX5 Em-i Max for the calibrated MVP |
| `Wtraffic`     | Traffic weight (free / light / moderate / heavy); stop-and-go ⇒ more accel/braking        |
| `Welevation`   | Terrain weight; uphill costs energy, downhill recovers some via regen                     |
| `Wtemperature` | Ambient-temperature weight; tropical heat raises AC/battery load                          |

Weights are **centered on 1.0** at baseline conditions (light traffic, flat terrain, ~30 °C).

This form is simple, explainable, and mobile-friendly — appropriate for the project. It has **two known approximations**, which the implementation refines in Tier 2 below:

1. **Auxiliary/AC load is physically _time-based_, not distance-based.** AC draws ~1–2.5 kW regardless of distance; on a hot, congested trip it can add tens of Wh/km purely because more _time_ is spent. A constant `Wtemperature` multiplier cannot express the traffic↔AC interaction that dominates Metro Manila driving.
2. **Elevation is _signed and additive_ (potential energy `m·g·Δh`)**, and long descents can _recover_ energy (net-negative). A symmetric multiplier clamped near 1.0 cannot represent strong regen.

---

## 2. Two implementation tiers

Both tiers share the headline equation; they differ in fidelity and use.

### Tier 1 — pure multiplicative (quick estimate)

`segmentConsumptionWhPerKm()` / `estimateTripEnergy()`.

- Computes `E = Ebase × Wtraffic × Welevation × Wtemperature` directly.
- Cheap and explainable — suitable for a **client-side preview** before the API round-trip.
- Must be calibrated with **log-linear regression** (§4) for the multiplicative factors to be statistically valid.

### Tier 2 — semi-physical, per-segment (authoritative; used by the API)

`estimateRouteEnergy()` loops over route segments and decomposes each segment's battery energy into three honest terms:

```
E_seg(Wh) = (Ebase · d · Wtraffic)            ← rolling + aero, traffic-scaled, distance-based
          + elevationEnergyWh(Δh)             ← SIGNED potential energy; regen when Δh < 0
          + auxiliaryEnergyWh(T, t)           ← AC/electronics, TIME-based
```

where for the reference vehicle (params in `REFERENCE_VEHICLE`):

```
elevationEnergyWh(Δh) = (m · g · Δh / 3600) / η_drive    if Δh ≥ 0   (climb)
                      = (m · g · Δh / 3600) · η_regen     if Δh < 0   (descent, recovers)

auxiliaryPowerW(T)    = clamp(baseAux + max(0, (T − T_comfort) · acW/°C), 0, maxAux)
auxiliaryEnergyWh(T,t)= auxiliaryPowerW(T) · t_hours
```

Route SoC is accumulated per segment:

```
SoC_i = SoC_0 − (Σ E_seg / batteryWh) × 100
```

Tier 2 fixes both approximations: AC scales with **time in traffic**, and elevation is **signed** with realistic regen.

> The headline multiplicative equation still stands — Tier 2 is that equation _decomposed into physically grounded terms_. `Wtraffic` now multiplies only the rolling/aero base (what driving dynamics actually affect), while elevation and AC are explicit.

---

## 3. Assumptions & constants (PLACEHOLDERS — calibrate before defense)

Defined in `packages/shared/src/energy.ts`. **All values below are placeholders for the Geely EX5 Em-i Max and must be replaced with fitted/measured values.**

| Constant                       | Placeholder                                        | Source after calibration                 |
| ------------------------------ | -------------------------------------------------- | ---------------------------------------- |
| `Ebase` (per `EVModel`)        | 0.15 kWh/km (150 Wh/km)                            | Manufacturer spec + regression intercept |
| `TRAFFIC_WEIGHTS`              | free 0.95 / light 1.0 / moderate 1.15 / heavy 1.35 | Log-linear regression                    |
| `massKg`                       | 1900                                               | Curb weight + typical occupants          |
| `drivetrainEfficiency` η_drive | 0.90                                               | Fitted / literature                      |
| `regenEfficiency` η_regen      | 0.65                                               | Fitted / literature                      |
| `baseAuxiliaryW`               | 300                                                | Measured idle draw                       |
| `acWattsPerDegreeC`            | 120                                                | Fitted from temperature vs consumption   |
| `acComfortBaselineC`           | 24                                                 | Assumption                               |
| `maxAuxiliaryW`                | 3000                                               | Spec / measurement                       |

Other assumptions: routes are segmented (Google Directions steps); per-segment grade from the Elevation API; ambient temperature from Open-Meteo (free, no key) fetched once at the route midpoint and applied to every segment, falling back to `BASELINE_TEMPERATURE_C` when the lookup fails; SoC is not clamped to 0 so "won't make it" is representable as a negative arrival SoC.

---

## 4. Calibration algorithm (from test-drive data)

> **Important:** ordinary multiple regression yields an _additive_ model. To obtain _multiplicative_ weights, regress in **log space** (log-linear regression).

1. **Collect** controlled drives on the four route archetypes (heavy traffic, mixed, elevation, highway), varying time-of-day and temperature.
2. **Segment** each drive (per Directions step, or per ~1–2 km).
3. **Per segment, record:** start/end SoC, distance, time, traffic level, net grade (%), ambient temperature, average speed. Compute **actual consumption**:
   ```
   actual Wh/km = (ΔSoC% × batteryWh) / distance_km
   ```
4. **Fit (Tier 1 — multiplicative via log-linear):**
   ```
   ln(E) = ln(Ebase) + β₁·x_traffic + β₂·x_grade + β₃·(T − T_baseline)
   ⇒  Wtraffic = exp(β₁·x_traffic),  Welevation = exp(β₂·x_grade),  Wtemperature = exp(β₃·ΔT)
   ```
   **Fit (Tier 2 — decomposed):** regress the additive terms to recover `Ebase`, the `Wtraffic` multipliers, effective `η_drive`/`η_regen`, and the auxiliary power model `baseAux`, `acW/°C`.
5. **Hold out** ~20–30% of segments for validation (never validate on training rows).
6. **Write** the fitted constants into `energy.ts` (and per-`EVModel` `Ebase` into the seed/DB).

---

## 5. Runtime algorithm (per `/optimize` request)

```
1. Validate TripPlan (zod).
2. Fetch EVModel (Ebase, batteryCapacityKWh).
3. getRouteData(origin, destination):           # services/maps.ts
     - Google Directions → per-step distance, duration; distribute traffic delay
     - one Elevation lookup at step boundaries → signed Δh per segment
     - (fallback: single haversine segment when no API key)
4. estimateRouteEnergy({segments, Ebase, battery, initialSoC}):   # energy.ts (Tier 2)
     for each segment: E_seg = drive + elevation(signed) + aux(time-based)
     accumulate → totalKWh, arrival SoC, min SoC, per-waypoint SoC
5. If arrival/min SoC < threshold → PostGIS ST_DWithin for nearby stations.
6. Return TripResult.
```

Target latency ≤ 10 s (NFR-03): 1 Directions + 1 Elevation + 1 Open-Meteo call, with response caching.

---

## 6. Validation protocol

- **Metrics:** Mean Absolute Percentage Error (MAPE) and Root Mean Square Error (RMSE) of predicted vs actual, on **held-out** segments.
  ```
  MAPE = (100/n) Σ |(actual − predicted) / actual|
  RMSE = sqrt( (1/n) Σ (actual − predicted)² )        # Wh/km
  ```
- **Targets:** MAPE ≤ 15% (NFR-01), RMSE ≤ 80 Wh/km (NFR-02).
- **Report per route archetype**, not just one blended figure — more honest and informative.
- **If targets are missed**, frame the contribution as the _methodology_ ("local calibration reduces error from X% to Y% vs uncalibrated/manufacturer estimates") and recalibrate with an expanded dataset.

---

## 7. Limitations & future work

- **Single-vehicle calibration** (Geely EX5). Other `EVModel`s use uncalibrated defaults — label them as estimates.
- **Battery aging / SoH** not modeled (assumes rated capacity).
- **Weather** is a single route-midpoint temperature applied to all segments (no per-segment sampling, humidity, or precipitation) via Open-Meteo; per-segment weather is future work.
- **Tier 2 physical params** (mass, efficiencies, AC) are reference-vehicle constants, not per-`EVModel` columns — intentional for the MVP; would become per-model config for multi-vehicle support.
- **No charging-curve / route-optimization** modeling (deferred — see `MVP_SCOPE_AND_FEASIBILITY.md`).

---

## 8. Code map

| Concept                                              | Location                                  |
| ---------------------------------------------------- | ----------------------------------------- |
| Tier 1 + Tier 2 model                                | `packages/shared/src/energy.ts`           |
| Route segmentation (Directions + Elevation)          | `apps/api/src/services/maps.ts`           |
| Orchestration (validate → route → energy → stations) | `apps/api/src/routes/trips.ts`            |
| Vehicle baseline (`Ebase`, capacity)                 | `EVModel` entity + `apps/api/src/seed.ts` |
