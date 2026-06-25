# Capstone Paper — MVP Alignment Change Set (from → to-be)

> **Purpose:** A reviewable list of the edits that would align `docs/MO-IT200D1 _ A3101 Team Kaizen Capstone 1 Paper.md` with the narrowed scope in `docs/MVP_SCOPE_AND_FEASIBILITY.md`.
> **Status:** PROPOSED — **no edits have been applied to the paper.** Review, then tell me which to apply.
> **Date:** 2026-06-25

## Guiding principle

Narrow the paper's _delivered_ scope to the MVP hero — **localized SoC/range prediction (single reference vehicle) + charging-station display** — and demote **route optimization (FR-03)** and **crowdsourced reporting (FR-10)** to a clearly-labeled **Future Work / Phase 2**. Every objective, research question, system goal, and scope statement that currently _promises_ those two features must be walked back in step, or the paper contradicts itself.

## Priority legend

- 🔴 **Needed** — without it the paper promises features the MVP won't deliver (internal contradiction a panel will catch).
- 🟡 **Recommended** — strengthens honesty/defense.
- 🟢 **Optional** — polish / team judgment call.

## Summary

| #     | Section                                       | Change                                                                                                                         | Priority |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| CH-1  | Functional Requirements (Table 3)             | Add a **Scope** column; mark FR-03 & FR-10 as **Phase 2**                                                                      | 🔴       |
| CH-2  | Research Objective 3                          | Drop crowdsourced reports; reframe "routing" → range/SoC/charging                                                              | 🔴       |
| CH-3  | Research Questions 4 & 5                      | Soften "route optimization" → energy/SoC annotation; move the routing-algorithm question to future scope                       | 🔴       |
| CH-4  | System Goal "Energy-Aware Route Optimization" | Reframe to energy-aware route **information** (annotate, don't rank)                                                           | 🔴       |
| CH-5  | Scope & Limitations                           | Reframe optimization → annotation; add single-vehicle scope; list deferred items + weather/charging data sources as boundaries | 🔴       |
| CH-6  | Statement of the Problem (closing)            | Soften "intelligent route optimization" → "energy-aware range prediction"                                                      | 🟡       |
| CH-7  | Methodology — validation & data sources       | Add per-route-type + held-out validation; name Open-Meteo (temperature) & OpenChargeMap (charging supplement)                  | 🟡       |
| CH-8  | RRL — Google Maps subsection                  | Add the developer-API limitation (SoC/charging-stop routing is consumer-app only) — strengthens the gap                        | 🟡       |
| CH-9  | Title / "Optimizer" wording                   | Decide: keep title (reframe meaning) vs. retitle                                                                               | 🟢       |
| CH-10 | Ordered-list numbering bug                    | Fix RQ list rendering as 7–15 and duplicate "6." section numbers                                                               | 🟢       |

---

## CH-1 🔴 — Functional Requirements table: add a Scope column

**Why:** FR-03 (route ranking) and FR-10 (crowdsourcing) are deferred by the MVP. Don't delete them (they're legitimate Phase 2), but mark them so the build scope is unambiguous and the System/UAT tests that reference "FR-01 through FR-10" still resolve.

**FROM** (current — all ten are implicitly in scope):

```
| ID    | Requirement                    | Description ... | Priority |
| FR-03 | Energy-Efficient Routing       | ... ranked by predicted energy consumption ... | High   |
| FR-10 | Crowdsourced Station Reporting | ... submit and view status reports ...          | Medium |
```

**TO-BE** (add a **Scope** column; FR-03 & FR-10 → Phase 2):

```
| ID    | Requirement                    | Description ...                                  | Priority | Scope   |
| FR-01 | EV Range Prediction            | ...                                              | High     | MVP     |
| FR-02 | State-of-Charge Display        | ...                                              | High     | MVP     |
| FR-03 | Energy-Efficient Routing       | ... ranked by predicted energy consumption ...   | High     | Phase 2 |
| FR-04 | Charging Station Locator       | ...                                              | High     | MVP     |
| FR-05 | Real-Time Traffic Integration  | ...                                              | High     | MVP     |
| FR-06 | Elevation Data Integration     | ...                                              | High     | MVP     |
| FR-07 | EV Model Configuration         | ...                                              | Medium   | MVP     |
| FR-08 | User Account Management        | ...                                              | Medium   | MVP     |
| FR-09 | Reachable Range Visualization  | ...                                              | Medium   | MVP     |
| FR-10 | Crowdsourced Station Reporting | ...                                              | Medium   | Phase 2 |
```

Plus a one-line note under the table: _"MVP delivers FR-01, FR-02, FR-04–FR-09. FR-03 (energy-efficient route ranking) and FR-10 (crowdsourced reporting) are Phase 2 / Future Work; the MVP uses the navigation provider's recommended route and annotates it with predicted energy and SoC."_

---

## CH-2 🔴 — Research Objective 3

**Why:** It promises _crowdsourced charging station reports_ (deferred FR-10) and "routing" as a delivered outcome.

**FROM:**

> 3. To integrate live data from mapping and traffic APIs (such as Google Maps), traffic systems, and crowdsourced charging station reports to provide up-to-date routing and range information within the application.

**TO-BE:**

> 3. To integrate live data from mapping, traffic, and elevation APIs (the Google Maps Platform) together with an integrated charging-station directory, in order to provide up-to-date range, State-of-Charge, and charging-accessibility information within the application.

---

## CH-3 🔴 — Research Questions 4 and 5

**Why:** RQ4 and RQ5 frame _route optimization_ as a study outcome. The MVP annotates routes with energy/SoC; it does not rank alternatives.

**RQ4 — FROM:**

> How can real-time traffic conditions, terrain elevation, and charging station availability be integrated into an EV range prediction and route optimization model?

**RQ4 — TO-BE:**

> How can real-time traffic conditions, terrain elevation, and ambient temperature be integrated into a localized EV range and State-of-Charge prediction model?

**RQ5 — FROM:**

> How can a routing algorithm be designed to recommend energy-efficient routes instead of relying solely on shortest-distance navigation?

**RQ5 — TO-BE (Option A, recommended — keep an MVP-aligned question):**

> How can predicted energy consumption and State-of-Charge be presented along a planned route to support energy-aware travel and charging decisions?

**RQ5 — TO-BE (Option B — keep the routing question but scope it as future):** move the original wording into a "directions for future research" subsection rather than a study question.

> _(Pick A or B. A keeps the question count stable and stays defensible; B preserves the original ambition explicitly as future work.)_

---

## CH-4 🔴 — System Goal: "To Offer Energy-Aware Route Optimization"

**Why:** The goal title and text promise route ranking ("recommend routes that minimize predicted energy consumption").

**FROM:**

> **To Offer Energy-Aware Route Optimization.** Rather than relying solely on shortest-distance or shortest-time routing, Voltpath PH aims to recommend routes that minimize predicted energy consumption by factoring in real-time traffic conditions and route elevation profiles. ...

**TO-BE:**

> **To Provide Energy-Aware Route Information.** Voltpath PH annotates the navigation provider's recommended route with predicted energy consumption and per-waypoint State-of-Charge, factoring in real-time traffic, elevation, and ambient temperature, so drivers can judge whether a trip is feasible and where to charge. Ranking alternative routes by predicted energy (full route optimization) is identified as Future Work.

---

## CH-5 🔴 — Scope and Limitations

**Why:** The Scope promises a "route optimization feature"; the Limitations don't yet bound the MVP to a single calibrated vehicle or list the deferred features and the real data sources.

**Scope paragraph — FROM:**

> The study includes the development of a route optimization feature that recommends energy-efficient travel routes instead of relying solely on shortest-distance navigation. The system will integrate real-time traffic information and a charging station directory to help users identify accessible charging locations during travel.

**Scope paragraph — TO-BE:**

> The study includes annotating the recommended travel route with predicted energy consumption and State-of-Charge so drivers can assess trip feasibility, together with an integrated charging-station directory that surfaces accessible charging locations along the route. The localized prediction model is calibrated for a single reference vehicle, the Geely EX5 Em-i Max; additional EV models are supported using manufacturer-default consumption rates that are clearly labeled as uncalibrated estimates.

**Add to Limitations and Boundaries (new bullet/paragraph):**

> The following capabilities are outside the scope of this version and are identified as Future Work: ranking of alternative routes by predicted energy (energy-efficient route optimization), calibration of the prediction model for multiple vehicle models, and crowdsourced charging-station status reporting. Ambient temperature is obtained from a third-party weather service (Open-Meteo), and charging-station coverage is supplemented from OpenChargeMap and a manually curated Philippine dataset where mapping-provider coverage is sparse; the system's accuracy therefore remains dependent on the availability and quality of these external sources.

---

## CH-6 🟡 — Statement of the Problem (closing sentence)

**FROM:**

> ... a mobile application designed to provide localized EV range prediction and intelligent route optimization using real-time traffic and terrain data.

**TO-BE:**

> ... a mobile application designed to provide localized EV range and State-of-Charge prediction, with energy-aware route information and charging-station accessibility, using real-time traffic, terrain, and temperature data.

---

## CH-7 🟡 — Methodology: validation honesty & data sources

**7a — Recalibration/validation sentence — FROM:**

> If MAPE or RMSE targets are not met after initial calibration, the regression analysis will be re-run with an expanded dataset and the weighting factors will be recalibrated. Route tests will be conducted during both peak and off-peak periods to ensure the model generalizes across traffic conditions.

**TO-BE (add per-route-type + held-out reporting):**

> Model accuracy will be reported per route archetype (heavy traffic, mixed, elevation, highway) rather than as a single blended figure, and validation will use route segments held out from the data used to fit the weighting factors. If MAPE or RMSE targets are not met after initial calibration, the regression will be re-run on an expanded dataset and the weighting factors recalibrated; where targets remain unmet, the contribution will be reported as the relative error reduction achieved by local calibration versus uncalibrated manufacturer estimates. Route tests will be conducted during both peak and off-peak periods.

**7b — Add a runtime data-source note** (the test-drive section already lists temperature sources for data collection; add one line for the _app's_ runtime): _"At runtime, ambient temperature for the energy model is retrieved from the Open-Meteo weather API."_

---

## CH-8 🟡 — RRL, Google Maps subsection: developer-API limitation

**Why:** Strengthens the research gap with a verifiable fact — Google's SoC/charging-stop routing is **not** in the developer API, only the consumer app. This is the precise opening Voltpath PH fills.

**Append to the Google Maps limitations paragraph:**

> Moreover, while the consumer Google Maps application and Android Auto can plan charging stops for long trips, this state-of-charge and charging-stop routing capability is not exposed through the Google Maps Platform developer APIs available to third-party applications; the developer Routes API offers only an eco-friendly, fuel-equivalent estimate (emission type ELECTRIC) rather than localized State-of-Charge prediction. Locally-developed applications such as Voltpath PH must therefore implement their own energy and SoC model on top of the platform's route, traffic, elevation, and place data.

_(Cite the Routes API eco-routes doc and the Google EV-features blog already listed in `MVP_SCOPE_AND_FEASIBILITY.md` §Sources.)_

---

## CH-9 🟢 — Title / "Optimizer" wording (team decision)

The title says **"…EV Range and Charging Optimizer…"** "Optimizer" can read as route optimization (now Phase 2).

- **Option 1 (recommended — no retitle):** Keep the title; add one clause early in the Introduction defining "optimizer" as _range- and charging-decision support_ (feasibility + charging guidance), not route ranking. Lowest churn for an already-circulated title.
- **Option 2 (retitle):** e.g., _"Voltpath PH: A Mobile-Based EV Range and Charging Prediction System for Philippine Road and Traffic Conditions."_ Cleaner but touches the cover, approval sheet, declaration, and all references to the title.

> Recommendation: **Option 1** unless the panel/adviser prefers a literal title.

---

## CH-10 🟢 — Ordered-list numbering artifacts

Markdown export side-effects (cosmetic, but visible in rendering):

- The **Research Questions** render as **7–15** instead of 1–9 (the list starts at "7.").
- Several chapter subsection headings are numbered **"6."** (Research Objectives, Significance, Scope) instead of C/E/F.

**Fix:** renumber the RQ list to start at 1, and correct the subsection numbering to match the Table of Contents (A–F). Low risk, improves polish.

---

## Deliberately NOT changed (and why)

- **FR-05 (Real-Time Traffic)** stays **MVP** — traffic is built into the Routes API the MVP already uses; it is not deferred.
- **The energy formula / model** — already corrected (rule-based, log-linear) in prior passes; no change here.
- **DB host (Supabase) and Auth (Supabase Auth)** — already reconciled across the paper; no change.
- **Objectives 1, 2, 4, 5** — already MVP-aligned (calibrated model, visual UI, MAPE/RMSE evaluation, viability).

---

## Next step

Tell me which changes to apply (e.g., "apply CH-1 through CH-5 and CH-8", or "all 🔴 and 🟡"). I'll edit the paper and re-verify table/FR/figure cross-references afterward. For CH-3 and CH-9, note your **Option A/B** and **Option 1/2** choices.
