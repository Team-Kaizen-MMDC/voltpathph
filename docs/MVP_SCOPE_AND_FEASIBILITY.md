# Voltpath PH — MVP Scope & Feasibility Review

> **Purpose:** An independent review of `docs/MO-IT200D1 _ A3101 Team Kaizen Capstone 1 Paper.md` to define a realistic, defensible MVP that a 3-person team can build to a working state in **under 12 weeks**, with every data source and API confirmed available.
> **Date:** 2026-06-25
> **Bottom line:** Narrow the project to **one defensible core — localized EV State-of-Charge (SoC) & range prediction for Philippine routes, calibrated on a single reference vehicle (Geely EX5 Em-i Max), with charging stations shown along the route.** Defer route _optimization_, multi-vehicle calibration, and crowdsourcing to "future work."

---

## 1. Independent review: full vision vs. 12-week reality

The paper's full scope spans **three pillars**:

| Pillar                                    | Paper scope                                         | 12-week feasibility                                                                                      |
| ----------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **A. Localized SoC/range prediction**     | Rule-based model calibrated by PH regression        | ✅ **Feasible and novel** — this is the real research gap                                                |
| **B. Energy-aware route _optimization_**  | Rank route alternatives by predicted energy (FR-03) | ⚠️ **Risky** — partially solved by Google eco-routing; "better than Google" is hard to prove in 12 weeks |
| **C. Charging directory + crowdsourcing** | Directory (FR-04) + user reports (FR-10)            | ◐ Directory is cheap (Google Places); crowdsourcing adds scope with little research value                |

**Why narrow?** A focused, rigorously-validated single-vehicle prediction model is _stronger science and a stronger defense_ than a broad, shallow build of all three pillars. The literature review and the API analysis in §4 both confirm that **localized SoC prediction is the genuine gap** — Google, Waze, and EVRO already do routing and charging display, but none localize battery prediction to PH conditions.

---

## 2. Recommended MVP

> **Voltpath PH (MVP): a mobile app that tells a Filipino EV driver — for a chosen route, starting battery %, and the Geely EX5 — how much battery the trip will use, the predicted arrival State-of-Charge, whether they can make it, and which charging stations lie along the way — using a consumption model calibrated to real Philippine driving data.**

**Primary user story:** _"As an EV driver, I enter where I'm going and my current battery %, and the app tells me if I'll make it and where I can charge — accurately, for Philippine roads."_

This MVP directly answers **RQ1, RQ3, RQ4, RQ6** and partially **RQ7**, and validates the paper's core contribution (the locally-calibrated energy model) with MAPE/RMSE.

---

## 3. Feature scope (IN vs. OUT)

### ✅ In scope (the MVP)

| MVP feature                                                            | Maps to          | Notes                                                                       |
| ---------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------- |
| Address search for origin/destination                                  | —                | Google Places Autocomplete (replaces today's hardcoded coords)              |
| Single reference EV preset (Geely EX5) + 1–2 extras                    | FR-07            | One _calibrated_ vehicle; others use manufacturer defaults, clearly labeled |
| Route distance/duration/traffic                                        | FR-05            | Google Routes API (traffic baked in — not a separate toggle)                |
| Elevation/grade along route                                            | FR-06            | Google Elevation API                                                        |
| **Localized energy + SoC prediction**                                  | **FR-01, FR-02** | The hero feature — rule-based model, calibrated weights                     |
| **Reachability verdict** ("you'll arrive at ~38% / you can't make it") | FR-02            | Green/amber/red, the paper's stated UX                                      |
| Charging stations along/near route                                     | FR-04            | Google Places (New) `evChargeOptions` + PH supplement                       |
| Map view with route + SoC markers + station pins                       | FR-02/04         | `react-native-maps`                                                         |
| **Model validation** (MAPE/RMSE vs real test drives)                   | NFR-01/02        | The defensible result                                                       |
| Minimal account + saved trips (optional)                               | FR-08            | Cheap via Supabase Auth; can be a stretch goal                              |

### ⛔ Deferred to "future work" (state this explicitly in the paper)

| Deferred                                                | Why defer                                                                                                                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Energy-efficient route **ranking/optimization** (FR-03) | Google already eco-routes; proving a better localized optimizer needs more data/time than 12 weeks. MVP uses Google's recommended route and **annotates** it with energy/SoC. |
| Multi-vehicle **calibration**                           | Calibrating one vehicle well is already the bulk of the work; others get uncalibrated defaults.                                                                               |
| Crowdsourced station reporting (FR-10)                  | Adds CRUD + moderation scope with little research value; Google availability covers most of it.                                                                               |
| Web app as a user product                               | Keep web as a tiny admin/demo only; the paper's product is mobile.                                                                                                            |

> **Action for the paper:** if you adopt this, re-mark **FR-03** (and optionally FR-10) as _Future Work_ rather than MVP — and align Research Objective 3 / RQ5 wording so the scope is internally consistent (see `REVIEW_AND_IMPROVEMENTS.md` §9.2).

---

## 4. Can Google Maps Platform deliver this? (capability matrix)

**Yes — for everything except the SoC prediction itself, which is your job (and your novelty).**

| Capability                                                                      | Google API                                        | Verdict                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Route geometry, distance, duration, **live traffic**                            | **Routes API** (Compute Routes, `TRAFFIC_AWARE`)  | ✅ Yes                                                                            |
| Eco/energy estimate for an EV                                                   | Routes API (`emissionType: ELECTRIC`, eco-routes) | ◐ Gives a fuel-equivalent figure only — **not** SoC; we use our own model instead |
| Elevation / road grade                                                          | **Elevation API**                                 | ✅ Yes                                                                            |
| Charging station locations, **connector types, max kW, real-time availability** | **Places API (New)** `evChargeOptions`            | ✅ Yes (coverage varies in PH — supplement)                                       |
| Address search / autocomplete / geocoding                                       | **Places Autocomplete + Geocoding**               | ✅ Yes                                                                            |
| **Automatic charging-stop routing + State-of-Charge**                           | ❌ **Not in the developer API**                   | ❌ **No** — exists only in the _consumer_ Maps app / Android Auto                 |

**Key conclusion:** Google **cannot** compute localized SoC or charging-stop itineraries through its API — that capability is confined to its consumer apps. This is precisely the gap Voltpath PH fills: **we layer a PH-calibrated energy/SoC model on top of Google's route, traffic, elevation, and charging data.** That is a clean, honest, defensible contribution.

---

## 5. What else do we need to make it functional? (data & API sourcing)

Everything below is sourceable; only the calibration data requires fieldwork.

| Need                                                       | Source                                                                     | Cost / key                       | PH availability | Risk                                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| Route + traffic + distance/duration                        | Google **Routes API**                                                      | Billing key; monthly free credit | Excellent       | Low                                                                                        |
| Elevation / grade                                          | Google **Elevation API**                                                   | same key                         | Excellent       | Low                                                                                        |
| Charging stations (+ connectors, availability)             | Google **Places API (New)**                                                | same key                         | **Partial**     | Med — supplement with **OpenChargeMap** (free key) + a manually curated PH seed in PostGIS |
| Address search → coordinates                               | Google **Places Autocomplete / Geocoding**                                 | same key                         | Excellent       | Low                                                                                        |
| **Ambient temperature** (for Wtemperature)                 | **Open-Meteo** (free, no key) — or OpenWeatherMap free tier                | Free                             | Excellent       | Low                                                                                        |
| EV baseline consumption (Ebase), battery kWh               | **Manufacturer spec** (Geely EX5 Em-i Max)                                 | Free                             | n/a             | Low                                                                                        |
| **Localized weights** (Wtraffic, Welevation, Wtemperature) | **Your own controlled test drives** + regression                           | Time/effort                      | n/a             | **HIGH — this is the actual research work**                                                |
| Actual per-segment SoC (for validation)                    | Dashboard readout + GPS logger app; OBD-II dongle _if_ the EX5 exposes SoC | ~₱1–2k optional dongle           | n/a             | Med — **manual dashboard logging is the safe fallback**                                    |
| Auth, database, storage                                    | **Supabase** (Postgres + PostGIS + Auth)                                   | Free tier                        | n/a             | Low                                                                                        |
| API hosting                                                | **Railway**                                                                | Free/cheap                       | n/a             | Low                                                                                        |

**Concrete "make it functional" checklist:**

1. Google Cloud project with **billing enabled** and these APIs turned on: Routes, Elevation, Places (New), Geocoding/Autocomplete. Set a **quota cap + billing alert**.
2. Supabase project (enable PostGIS); Railway project for the API.
3. ~~Add a **weather lookup** (Open-Meteo) to the maps/conditions service for `temperatureC`.~~ ✅ Done — `apps/api/src/services/weather.ts`, wired into `getRouteData`.
4. Build a **charging-station ingestion** step: Google Places query for a PH bounding box + OpenChargeMap supplement + manual seed → store as PostGIS points (the schema already supports this).
5. Add **Places Autocomplete** to the trip input (today's clients use hardcoded coordinates — a real gap).
6. **Run the test drives** on the 4 route archetypes, record SoC/distance/conditions, run the regression, and replace the placeholder weights in `packages/shared/src/energy.ts`.
7. Build the 3 mobile screens (Trip input → Result with SoC + verdict + map → Station detail).

---

## 6. Is the stack capable? (vs. functional & non-functional requirements)

**Yes — the existing stack delivers the MVP's requirements.** Capability is not the constraint; calibration time is.

| Requirement                        | Stack element                                                        | Capable? |
| ---------------------------------- | -------------------------------------------------------------------- | -------- |
| FR-01/02 SoC & range prediction    | Rule-based model in `packages/shared` (built)                        | ✅       |
| FR-04 charging directory           | PostGIS `ST_DWithin` + Places (wired)                                | ✅       |
| FR-05/06 traffic + elevation       | Routes + Elevation services (wired)                                  | ✅       |
| FR-07 EV preset                    | `EVModel` entity + seed (Geely added)                                | ✅       |
| FR-08 accounts                     | Supabase Auth + verify middleware (built)                            | ✅       |
| NFR-01/02 MAPE ≤15% / RMSE ≤80     | **Depends on calibration, not the stack** — see §7                   | ⚠️       |
| NFR-03 ≤10 s response              | Cache Routes/Elevation; single round-trip                            | ✅       |
| NFR-04 99% uptime (eval window)    | Railway + Supabase managed                                           | ✅       |
| NFR-05 auth / OWASP                | Supabase Auth, JWT verify, input validation, no error leakage (done) | ✅       |
| NFR-06 Android + iOS, one codebase | Expo / React Native                                                  | ✅       |
| NFR-07 shared logic                | Monorepo `packages/shared`                                           | ✅       |

---

## 7. Be realistic about the accuracy targets (NFR-01/02)

MAPE ≤ 15% and RMSE ≤ 80 Wh/km are **achievable for one well-calibrated vehicle**, but they hinge on the size and quality of the test-drive dataset — the project's biggest risk. Recommendations to keep the result defensible:

- **Calibrate and validate on the same 4 route archetypes** (heavy traffic, mixed, elevation, highway) — don't over-claim generality.
- **Report accuracy per route type**, not just one blended number — it's more honest and more informative.
- **Hold out** some segments for validation (don't validate on the exact rows used to fit the weights).
- If targets aren't met, **frame the contribution as the methodology** ("the locally-calibrated approach reduces error from X% (manufacturer/uncalibrated) to Y%"), which is still a valid result, rather than a pass/fail gate.
- Start test drives in **Week 1–2**, not Week 7 — data collection is the long pole.

---

## 8. Realistic 12-week plan (MVP)

| Weeks     | Focus                                                                                                                            | Output                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **1–2**   | Lock MVP scope; Google Cloud + Supabase + Railway setup; app shell + navigation; **address autocomplete**; **begin test drives** | Running skeleton; first drive data              |
| **3–4**   | Backend: Routes + Elevation + Places + Open-Meteo wired; station ingestion to PostGIS; energy model with default weights         | `/optimize` returns real predictions end-to-end |
| **5–6**   | Mobile screens: Trip input → Result (SoC + reachability verdict + map) → Station detail                                          | Demoable happy path                             |
| **7–8**   | Continue/finish test drives; run regression; **replace placeholder weights**; tune                                               | Calibrated model                                |
| **9–10**  | Validation (MAPE/RMSE, held-out), bug fixing, UAT (SUS), perf/caching                                                            | Validation results + UAT report                 |
| **11–12** | Buffer; EAS build; documentation; defense rehearsal                                                                              | Final build + defense pack                      |

> Test drives run **in parallel from Week 1**, not as a late phase — they gate the headline result.

---

## 9. Top risks & mitigations

| Risk                                        | Severity | Mitigation                                                                       |
| ------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Not enough test-drive data to hit MAPE/RMSE | **High** | Start Week 1; single vehicle; per-route-type reporting; methodology framing (§7) |
| Geely EX5 doesn't expose SoC via OBD-II     | Med      | Manual dashboard logging + GPS timestamping (no dongle dependency)               |
| Sparse Google charging coverage in PH       | Med      | Supplement with OpenChargeMap + manual curated seed                              |
| Google Maps API cost overrun                | Med      | Free monthly credit + caching (built) + hard quota cap + billing alerts          |
| Scope creep back into routing/crowdsourcing | Med      | This document is the scope guard; FR-03/FR-10 marked Future Work                 |
| Calibration ≠ generalization                | Med      | Validate on held-out segments; don't claim nationwide accuracy                   |

---

## 10. How to defend the narrowing (for the panel)

1. **It targets the real gap.** The RRL and a direct API capability analysis (§4) show Google/Waze/EVRO already provide routing and charging _display_ — but **none localize battery/SoC prediction to PH traffic, terrain, and heat.** That is the contribution.
2. **Depth over breadth is better science.** One vehicle, calibrated against real data, with rigorous MAPE/RMSE validation, is more defensible than a broad app that does many things shallowly.
3. **It's honestly sourceable.** Every input has a confirmed source (§5); the only fieldwork — the test drives — is exactly the original research.
4. **It remains extensible.** The architecture (shared energy model, monorepo, PostGIS) scales to multi-vehicle and route optimization later, so the deferred pillars become a credible Future Work section.

---

## Sources (API capability verification)

- [Introducing the new Places API with EV, accessibility features, and more — Google Maps Platform](https://mapsplatform.google.com/resources/blog/introducing-the-new-places-api-with-access-to-new-ev-accessibility-features-and-more/)
- [REST Resource: places (evChargeOptions) | Places API | Google for Developers](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)
- [Package google.maps.routing.v2 | Routes API | Google for Developers](https://developers.google.com/maps/documentation/routes/reference/rpc/google.maps.routing.v2)
- [Get an eco-friendly route (emissionType ELECTRIC) | Routes API](https://developers.google.com/maps/documentation/routes/eco-routes)
- [Charge it up: New Maps features for electric vehicles — Google](https://blog.google/products/maps/charge-it-new-maps-features-electric-vehicles/)
- [Google Maps Is Bringing EV Route Planning To Android Auto — InsideEVs](https://insideevs.com/news/791556/google-maps-ev-route-planning-android-auto/)
- [Open-Meteo — free weather API](https://open-meteo.com/) · [OpenChargeMap API](https://openchargemap.org/site/develop/api)
