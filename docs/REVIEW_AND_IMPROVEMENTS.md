# Voltpath PH — Codebase, Documentation & Capstone Paper Review

> **Type:** Advisory review (no changes applied to code, docs, paper, or skills).
> **Date:** 2026-06-25
> **Reviewer:** Automated review against industry standards (OWASP, 12-Factor, monorepo & TypeScript best practices) and academic-paper consistency.
> **Scope:** `apps/*`, `packages/shared`, `docs/*`, `skills/*`, root config, and `docs/MO-IT200D1 _ A3101 Team Kaizen Capstone 1 Paper.md`.

---

## How to read this document

Every finding is tagged with a severity and, where possible, a precise location:

| Tag             | Meaning                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| 🔴 **Critical** | Breaks functionality, is a security risk, or is a verifiably false claim. Fix before defense/deploy. |
| 🟠 **High**     | Significant correctness, consistency, or standards gap.                                              |
| 🟡 **Medium**   | Quality/maintainability issue or notable inconsistency.                                              |
| 🟢 **Polish**   | Cosmetic, wording, or nice-to-have.                                                                  |

---

## 1. Executive Summary

The repository is well-organized as a Turborepo monorepo and the documentation set is unusually thorough for a Capstone. The **single biggest risk is a systematic mismatch between what the documentation/paper claims is built and what the code actually implements.** The docs describe a physics engine, an 8-table schema, JWT auth, CI/CD, and route optimization; the code currently ships a mocked trip endpoint, two entities, no authentication, and no CI workflow.

This is partially acceptable because Capstone 1 is a **proposal** — but several documents assert these features in the present/perfect tense ("verified", "corrected", "powered by the physics engine"), which produces contradictions that an evaluation panel or code reviewer will flag.

**Top priorities, in order:**

1. 🔴 Fix the SRID `4324` → `4326` bug (and the CHANGELOG that falsely claims it's done).
2. 🔴 Choose **one** energy model (rule-based vs. physics) and make paper, docs, skills, and code agree.
3. 🔴 Decide the database host story (Supabase **vs.** Railway Postgres) — three documents disagree.
4. 🟠 Align the documentation tense/claims with the proposal status, or implement the missing pieces.
5. 🟠 Add the security and CI foundations the docs already promise (auth, helmet, rate-limit, GitHub Actions).
6. 🟠 Fix the Capstone paper's internal numbering (tables, figures, FR-09/FR-10 references) and front-matter placeholders.

---

## 2. 🔴 Critical Findings

### 2.1 SRID `4324` bug — spatial queries are silently broken

- **Where:** `apps/api/src/entities/ChargingStation.ts:16` (`srid: 4324`) and `apps/api/src/routes/stations.ts` (`ST_SetSRID(ST_Point(:lng, :lat), 4324)`).
- **Problem:** `4324` is not the WGS-84 GPS reference system. The correct SRID is **`4326`**. With a non-existent/mismatched SRID, PostGIS `ST_DWithin` results will be wrong or error out.
- **Compounding issue:** `CHANGELOG.md` (`[1.0.0-beta]` → _Changed_) explicitly states this was _"Corrected … to SRID 4326 … in backend routes and entities."_ It was **not**. `docs/DATABASE.md`, `docs/BACKEND.md`, `docs/ARCHITECTURE.md`, and the `voltph-maps-gis` skill all correctly say `4326` — only the code is wrong.
- **Fix:** Change both occurrences to `4326`; re-seed; verify `ST_DWithin`. Then the CHANGELOG claim becomes true.

### 2.2 Two contradictory energy models across the project

- **Paper (canonical for the study):** rule-based multiplicative model `E = Ebase × Wtraffic × Welevation × Wtemperature`, with weights from regression on PH test-drive data. The RRL (§"Rule-Based and Coefficient Models", "Machine Learning-Based Prediction") deliberately argues _against_ physics/ML for a mobile deployment.
- **Docs & skills (contradicting):** `docs/ARCHITECTURE.md`, `docs/DATABASE.md` (`drag_coefficient`, `frontal_area_sqm`, `mass_kg`, `rolling_resistance_coefficient`), `docs/TESTING.md` (references `packages/shared/src/physics.ts`), and the `voltph-ev-physics` skill all describe a **force-based physics engine** (`F_roll + F_drag + F_gravity + F_accel`).
- **Code:** implements _neither_ — `apps/api/src/routes/trips.ts` returns hard-coded mock values; `packages/shared/src/physics.ts` **does not exist**.
- **Fix:** Pick the rule-based model (it matches the paper and the stated mobile/explainability rationale). Update ARCHITECTURE/DATABASE/TESTING and `voltph-ev-physics` to describe the rule-based weights; demote the physics force-model to an explicit "future work / alternative" note. Remove the `Cd/mass/Cr` columns from the documented schema unless they will actually be used.

### 2.3 Database host story conflicts (Supabase vs. Railway)

- **Paper §System Design:** _"PostgreSQL database hosted on Supabase."_ **Paper §Implementation Plan:** _"railway.json … defines three Railway services: api, web, and a managed PostgreSQL service."_
- **`railway.json`:** defines **only** `voltph-api` and `voltph-web` — there is **no** PostgreSQL service in the file.
- **`docs/DEVOPS.md`:** "Provision a PostgreSQL service within the same Railway project." **`docs/ARCHITECTURE.md`/`DATABASE.md`:** "Supabase Managed PostgreSQL." **`docs/TECH_STACK.md`:** lists Render/Vercel/Supabase/Neon/Aiven as options.
- **Fix:** Decide one canonical host. If Supabase: correct the Implementation Plan and DEVOPS, and document that the DB lives outside `railway.json`. If Railway PG: correct System Design/ARCHITECTURE/DATABASE and actually add the DB service (or note it's provisioned via the Railway dashboard, since plugins aren't always in `railway.json`).

### 2.4 `synchronize: true` against a schema that doesn't match the docs

- **Where:** `apps/api/src/data-source.ts:28` (`synchronize: true // Be careful with this in production`).
- **Problem:** `synchronize: true` auto-mutates the live schema from entities on every boot — dangerous in production and a documented anti-pattern. Worse, the only registered entities are `EVModel` and `ChargingStation`, so the auto-generated schema will **not** contain the 8 tables documented in `DATABASE.md` (`user`, `user_vehicle`, `trip`, `trip_waypoint`, `charger_connector`, `station_report`) nor the physics columns. The DB the code creates ≠ the DB the docs describe.
- **Fix:** Set `synchronize: false`, add TypeORM **migrations** (the `migrations: []` array is empty), and either implement the documented entities or scope the docs down to what exists.

### 2.5 The core feature (`/api/trips/optimize`) is fully mocked

- **Where:** `apps/api/src/routes/trips.ts`.
- **Problem:** Returns hard-coded `totalDistanceKm: 120.5`, etc. No Google Maps call (the `@googlemaps/google-maps-services-js` dependency is installed but **never imported anywhere**), no elevation, no temperature, no per-segment SoC, no PostGIS along-route station search. Meanwhile `docs/BACKEND.md` and `docs/ARCHITECTURE.md` show a detailed sequence diagram of this exact (unimplemented) flow.
- **Fix (proposal-appropriate):** Either implement a first real pass, or clearly label these flows as "planned" in the docs and mark the endpoint `// STUB` with a tracked issue. Don't present a stub as a working pipeline in a sequence diagram without a "planned" caption.

---

## 3. 🟠 Backend & API

| #   | Severity | Finding                                                                                                                                                                                                                                | Location / Evidence                                   |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 3.1 | 🟠       | **No authentication exists**, but `NFR-05` and `FR-08` require JWT, `DEVOPS.md` lists `JWT_SECRET`, and `TESTING.md` describes `/api/auth/register` & `/api/auth/login` tests. No auth route, middleware, or `User` entity is present. | `apps/api/src/` (no `auth` route); paper NFR-05/FR-08 |
| 3.2 | 🟠       | **Raw error objects are returned to clients** (`res.status(500).json({ message, error })`). This leaks stack traces/DB internals (OWASP A05).                                                                                          | `trips.ts`, `stations.ts`, `evModels.ts`              |
| 3.3 | 🟠       | **CORS is wide open** (`app.use(cors())`) — any origin. Restrict to known web/mobile origins for production.                                                                                                                           | `apps/api/src/index.ts`                               |
| 3.4 | 🟠       | **No security middleware**: no `helmet`, no rate limiting, no request size limits, no central error handler. The paper claims "OWASP Top 10 compliance" (NFR-05).                                                                      | `apps/api/src/index.ts`                               |
| 3.5 | 🟠       | **Validation schema exists but is unused.** `packages/shared/src/validation.ts` defines `TripPlanSchema` (zod), but `trips.ts` casts `req.body as TripPlan` with no validation. GEMINI.md mandates zod for shared schemas.             | `trips.ts` vs `validation.ts`                         |
| 3.6 | 🟡       | **No graceful failure if `DataSource.initialize()` rejects** — server simply logs and never starts; no `process.exit(1)` or health signal.                                                                                             | `index.ts`                                            |
| 3.7 | 🟡       | **No `/health` aggregation of DB readiness** — health check returns `ok` even if the DB is down (Railway healthcheck would pass on a broken service).                                                                                  | `index.ts` + `railway.json` healthcheck               |
| 3.8 | 🟢       | `console.log` used for logging; consider a structured logger (pino/winston) given the "no plaintext location logging" security note in `voltph-security`.                                                                              | `index.ts`                                            |

---

## 4. 🟠 Data Model & Seed Data

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                                           | Evidence                           |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 4.1 | 🟠       | **Seed data omits Geely entirely** — yet the Geely EX5 Em-i Max is the test/calibration vehicle and the source of `Ebase`. The seed has BYD ×2, Jetour, VinFast ×2, MG, Nissan, Hyundai, Kia.                                                                                                                                                     | `apps/api/src/seed.ts`             |
| 4.2 | 🟠       | **Target-vehicle set disagrees across sources.** Paper: "BYD, Geely, Jetour, and Vinfast". README: "(BYD, Jetour, Geely, Vinfast)". Seed: adds MG/Nissan/Hyundai/Kia, drops Geely.                                                                                                                                                                | paper §ERM, `README.md`, `seed.ts` |
| 4.3 | 🟠       | **Entity ↔ documented schema mismatch.** `EVModel` entity lacks `drag_coefficient`, `frontal_area_sqm`, `mass_kg`, `rolling_resistance_coefficient`, `created_at/updated_at` that `DATABASE.md` specifies. `ChargingStation` lacks `created_at/updated_at` and uses `simple-array plugTypes` instead of the documented `charger_connector` table. | `entities/*.ts` vs `DATABASE.md`   |
| 4.4 | 🟡       | **Units ambiguity.** Field is `averageConsumptionKWhPerKm` (kWh/km, e.g. `0.126`), but the paper's formula and NFRs use **Wh/km** (`Ebase`, `RMSE ≤ 80 Wh/km`). Document the conversion explicitly and keep one unit in the UI.                                                                                                                   | `EVModel.ts`, paper NFR-02         |
| 4.5 | 🟡       | **Placeholder image URLs** (`https://example.com/...`) in seed will render broken images.                                                                                                                                                                                                                                                         | `seed.ts`                          |
| 4.6 | 🟢       | `simple-array` for `plugTypes` prevents indexed querying by plug type (a documented filter feature). Consider `text[]` + GIN, or the `charger_connector` table.                                                                                                                                                                                   | `entities/*.ts`                    |

---

## 5. 🟠 Security (cross-cutting)

The `voltph-security` skill and `NFR-05` promise "OWASP Top 10 compliance", "credentials encrypted at rest", and "JWT-based authentication". Current state:

- 🔴/🟠 No auth, no password hashing (no `User` entity), no JWT — so "encrypted at rest" and "JWT for protected resources" are unmet.
- 🟠 Error/stack leakage (§3.2), open CORS (§3.3), missing helmet/rate-limit (§3.4).
- 🟢 Good: `.gitignore` correctly excludes `.env*` and `*.pem`; `DEVOPS.md` documents secret management (1Password/GitHub Secrets). Keep this.
- **Recommendation:** Add an explicit **Security checklist** to the DoD and a `voltph-security` reference file (see §10). Until auth ships, soften NFR-05 wording to "planned" in the paper.

---

## 6. 🟠 Testing

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                  | Evidence                       |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| 6.1 | 🟠       | **Tests don't cover the things the docs say they do.** Only two trivial tests exist: `apps/api/test/deployment.test.ts` (env-var wiring) and `apps/web/test/config.test.ts` (API URL fallback). There are **no** tests for the energy model, SoC calc, PostGIS queries, or auth — because those modules don't exist yet. | `apps/*/test/`                 |
| 6.2 | 🟠       | **`TESTING.md` references non-existent targets:** `packages/shared/src/physics.ts`, `/api/trips/optimize` integration tests with mocked Maps SDK, `/api/auth/*` tests, Playwright (web), `@testing-library/react-native` (mobile). None are present/configured.                                                          | `TESTING.md`                   |
| 6.3 | 🟠       | **"≥90% coverage on core calculation modules" (NFR + TESTING.md) is unverifiable** — no coverage tooling/threshold is configured (`jest --coverage`, `coverageThreshold`), and there are no calculation modules.                                                                                                         | `apps/api/package.json`        |
| 6.4 | 🟡       | **`packages/shared` has no test runner** despite TESTING.md saying shared math is unit-tested with Jest, and `turbo run test --filter=shared` is documented.                                                                                                                                                             | `packages/shared/package.json` |
| 6.5 | 🟢       | Good: Jest + Supertest (api) and Vitest + RTL (web) are already wired as deps — a solid foundation to build on.                                                                                                                                                                                                          | package.json files             |

**Recommendation:** Either implement the rule-based model in `packages/shared` and write its unit tests first (TDD), then mark coverage gates; or scope TESTING.md to current reality and label the rest "planned for Sprint 9–10".

---

## 7. 🟠 DevOps / CI / Deployment

| #   | Severity | Finding                                                                                                                                                                                                                                                                                           | Evidence                                |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 7.1 | 🟠       | **No CI exists.** `.github/` contains only `CODEOWNERS` — there is **no** `.github/workflows/`. Yet `GEMINI.md` ("Wait for CI checks (linting) to pass"), `DEVOPS.md` ("We use GitHub Actions"), and the paper all assert CI gates PRs. Branch protection cannot require checks that don't exist. | `.github/`                              |
| 7.2 | 🟡       | **`turbo.json` uses the legacy `pipeline` key.** Turbo v2 renamed it to `tasks`; with `"turbo": "^1.13.0"` it still works, but pinning/upgrading should switch to `tasks`. Also `outputs` includes `.next/**` though there is no Next.js app.                                                     | `turbo.json`, root `package.json`       |
| 7.3 | 🟡       | **`railway.json` lacks the DB service** and the web `start` relies on `$PORT` via `serve` — fine, but document that web is served as static `dist`, which means `VITE_API_URL` must be set at **build** time (it's inlined), not runtime.                                                         | `railway.json`, `apps/web/package.json` |
| 7.4 | 🟡       | **Node version not pinned.** Docs say "Node 18+", paper says "Node.js 18+", but there is no `engines` field or `.nvmrc`. NIXPACKS may pick a different major.                                                                                                                                     | root `package.json`                     |
| 7.5 | 🟢       | **`.gitignore` lists `.DS_Store` twice**, and a tracked `.DS_Store` exists at repo root. Remove the tracked file; dedupe the ignore.                                                                                                                                                              | `.gitignore`, root                      |
| 7.6 | 🟢       | **Stray artifact `voltph-ui-ux.skill`** (a zip) sits at repo root alongside `skills/voltph-ui-ux/`. Likely a packaging leftover; consider removing or moving to `.gemini/packages/`.                                                                                                              | repo root                               |

---

## 8. 🟡 Frontend (Web & Mobile)

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                                                             | Evidence                                  |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 8.1 | 🟠       | **Hardcoded IDs/coordinates that can't work against the real API.** `TripPlanner.tsx` sends `evModelId: "1"` and fixed Manila→Angeles coords; the typed inputs aren't used for geocoding. Since `EVModel.id` is a **UUID**, the API returns 404 and the UI only "works" via the `catch` mock fallback.                                                              | `apps/web/src/components/TripPlanner.tsx` |
| 8.2 | 🟡       | **Documented data-fetching standard not followed on web.** `TECH_STACK.md`, `GEMINI.md`, and deps say `axios` + `@tanstack/react-query`; web components use raw `fetch` and local state (`EVModelList.tsx`, `TripPlanner.tsx`). `FRONTEND_WEB.md` even says "standard `fetch` calls", contradicting the standard. Pick one and align.                               | web components vs docs                    |
| 8.3 | 🟡       | **Mobile app is a single static screen.** `apps/mobile/App.tsx` has no navigation, no `react-native-maps`, no API calls, hardcoded "100% / 320km" — yet `FRONTEND_MOBILE.md` and the paper describe 3 screens, native maps, react-query, and offline caching. `@react-native-async-storage/async-storage` (referenced by the mobile skill) isn't even a dependency. | `apps/mobile/`, docs                      |
| 8.4 | 🟡       | **Inline styles everywhere** (large style objects in JSX). Fine for a prototype, but consider CSS Modules (web) / `StyleSheet` extraction is already used on mobile. Matches `voltph-ui-ux` "Premium Shift" intent but isn't scalable.                                                                                                                              | web components                            |
| 8.5 | 🟢       | Web `App.tsx` calls itself "premium platform" and the mobile/web both hardcode demo stats — acceptable for a prototype, but flag as demo data so reviewers aren't misled.                                                                                                                                                                                           | `App.tsx` (both)                          |

---

## 9. Capstone Paper — Academic & Internal-Consistency Review

The paper is substantive and well-referenced. The issues below are about **internal consistency, numbering, tense, and a few content gaps** — the things a panel reads carefully.

### 9.1 🟠 Functional-requirement numbering is broken

- The FR table (§Functional Requirements) defines **FR-01 … FR-08**, with **FR-03 (Energy-Efficient Routing)** and **FR-05 (Real-Time Traffic Integration)** struck through.
- But other sections reference **"FR-01 through FR-10"** (System Testing; Table 7 System Testing row) and a **"FR-10" crowdsourced-reporting feature** (§Post-Deployment Maintenance; §"To Integrate a Dynamic Charging Station Directory"). **FR-09 and FR-10 are never defined.**
- **Fix:** Renumber to a contiguous list, add the missing FRs (charging-station status reporting; and either keep or formally drop traffic/routing), and update every cross-reference. Don't reference FR IDs that don't exist in the table.

### 9.2 🟠 Struck-through FR-03/FR-05 contradict the rest of the paper

- Removing **Energy-Efficient Routing** and **Real-Time Traffic Integration** via strikethrough conflicts with: the **title** ("…Charging Optimizer…"), **Research Objective 3**, **RQ5** ("how can a routing algorithm be designed to recommend energy-efficient routes"), **Development Plan Phase 4** ("Developing energy-efficient route recommendations"), and **Significance**. Either the scope genuinely narrowed (then update objectives/RQs/methodology to match) or these FRs should be restored. As written, the scope is self-contradictory.

### 9.3 🟠 Table & figure numbering is inconsistent

- In-text "summarized in **Table 2**" (Real-World EV Test Drives) points to a table **labeled "Table 1." (_Predefined Test Drive Routes_)**.
- Then "summarized in **Table 2**" again → **"Table 2." (_Sample Data Collection Sheet_)**.
- The Functional/Non-Functional tables are "Table 3" and "Table 4"; the **Sprint Timeline, Sprint Deliverables, and Technologies tables are unnumbered**; the Testing table jumps to **"Table 7"**. So the sequence is 1, 2, 3, 4, (gap), 7.
- **Fix:** Number tables sequentially (Table 1…N), make each in-text reference match its label, and number the unnumbered tables.

### 9.4 🟠 Front-matter placeholders not filled

- **List of Tables / Figures / Appendices** still read "Name of Table 1 … page #", and the **Table of Contents** uses literal page anchors. These must be populated before submission.

### 9.5 🟡 Tense inconsistency (proposal vs. completed)

- As Capstone **1** this is a proposal; most of it correctly uses future tense ("will be conducted"). But some passages read as completed work: System Testing "All functional requirements … **verified** across both Android and iOS", and `docs/TESTING.md` likewise. Keep proposal sections in future/conditional tense to avoid implying results you haven't gathered.

### 9.6 🟡 ABRP appears in Methodology but not in the Literature Review

- §"For the Navigation System" compares against **ABRP** ("A Better Route Planner"), but Chapter II only reviews Google Maps, Waze, and EVRO. Either add a short ABRP subsection to the RRL or drop the ABRP comparison.

### 9.7 🟡 Tech-stack claims inside the paper disagree (same as §2.3)

- §System Design/§Mobile-and-Cloud Architecture says **Supabase**-hosted PostgreSQL; §Implementation Plan says a **Railway** managed PostgreSQL defined in `railway.json`. Reconcile to one host and state it consistently.

### 9.8 🟢 Formatting / export artifacts

- The Markdown export left escaped characters throughout: `2022\.`, `11697\)`, `\<Insert panel's name\>`, `Welevation x Wtemperature` (mixing `×` and `x`). Clean these for the final PDF and standardize the formula notation (consistent `×` and subscripts `W_traffic`).
- Author/adviser name spelling varies: **"Glenn Baluyot"** (Approval, Acknowledgement) vs **"Glen Baluyot"** (Declaration, Conforme). Standardize.

### 9.9 🟢 Reference/citation hygiene

- Spot-check APA 7 consistency (italicized journal titles, DOIs as `https://doi.org/...`, issue numbers). Several in-text citations (e.g., Polat et al., 2025; Xie et al., 2025; Santander et al., 2026) should each have a matching entry in the References list — verify none are missing after the formatting cleanup.

---

## 10. Agent Skills — Recommended Additions & Updates

> The 15 skills in `skills/` are good role scaffolds, but several now **contradict the paper or the code**. Because the skills are the operating instructions for future AI-assisted work, fixing them prevents the doc/code drift from getting worse. **No skill files were modified in this review** — these are proposals for your approval.

### 10.1 Update existing skills

| Skill                  | Severity | Recommended change                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `voltph-ev-physics`    | 🔴       | **Realign to the rule-based model.** It currently teaches the force-based physics engine the paper explicitly de-scopes. Make the multiplicative `E = Ebase × Wtraffic × Welevation × Wtemperature` model canonical; keep the physics derivation as a clearly-labeled "alternative / future work" appendix. Rename intent to "EV energy estimation" rather than "physics". |
| `voltph-maps-gis`      | 🟡       | Already says "use SRID 4326, fix legacy 4324" — **the skill is correct, the code is not.** Add a one-line "verification step": grep for `4324` before claiming the fix is done (prevents the CHANGELOG-style false claim).                                                                                                                                                 |
| `voltph-security`      | 🟠       | Add a concrete, checkable hardening checklist (helmet, CORS allowlist, rate-limit, central error handler that never returns raw `error`, zod validation at the edge, `synchronize:false` + migrations, bcrypt/argon2 for passwords, JWT rotation). Tie to NFR-05.                                                                                                          |
| `voltph-test-engineer` | 🟠       | Reflect reality: note that calculation modules/`physics.ts` don't exist yet; require TDD for the energy model; specify how coverage thresholds are configured before claiming ≥90%.                                                                                                                                                                                        |
| `voltph-devops`        | 🟠       | Ship a canonical **GitHub Actions** workflow template (install → lint → build → test with Turbo remote caching) so "CI must pass" becomes real. Switch guidance to Turbo v2 `tasks` key. Clarify the Supabase-vs-Railway DB decision.                                                                                                                                      |
| `voltph-backend`       | 🟡       | Add: "every route validates input with the shared zod schema", "no raw error leakage", "use migrations, never `synchronize` in prod".                                                                                                                                                                                                                                      |
| `voltph-database`      | 🟡       | Note `synchronize:true` is dev-only; document the migration workflow; reconcile the documented 8-table schema with what is actually implemented.                                                                                                                                                                                                                           |
| `voltph-data-engineer` | 🟢       | Add Geely EX5 Em-i Max as a required seed entry (it's the calibration vehicle); reconcile the brand list with the paper.                                                                                                                                                                                                                                                   |
| `voltph-docs-engineer` | 🟠       | Add a **doc/code consistency** mandate: before documenting a feature as present, verify it exists in code; mark unbuilt features "Planned". This is the systemic fix for the §1 gap.                                                                                                                                                                                       |

### 10.2 Proposed new skills

| New skill                                  | Why it's needed                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `voltph-capstone-paper` (🟠 recommended)   | The paper is the project's central deliverable, but the only writing skill (`voltph-docs-engineer`) targets technical Markdown. A dedicated skill should enforce: APA 7, sequential table/figure numbering with matching in-text refs, proposal tense, FR/NFR cross-reference integrity, and front-matter completeness — exactly the §9 issues. |
| `voltph-consistency-auditor` (🟡 optional) | A cross-artifact "single source of truth" skill: when a fact changes (SRID, DB host, energy model, brand list, FR IDs), update paper + docs + skills + code together. Could instead be folded into `voltph-docs-engineer` to avoid skill sprawl.                                                                                                |

---

## 11. What's Already Good (keep doing this)

- Clean Turborepo layout with a real `packages/shared` type-sharing strategy (matches `NFR-07`).
- Strong documentation **breadth**: ARCHITECTURE/BACKEND/DATABASE/DEVOPS/TESTING/ONBOARDING with Mermaid diagrams and a Keep-a-Changelog + SemVer CHANGELOG.
- Husky + lint-staged + a real flat ESLint config with type-checked rules and a React/hooks setup.
- Sensible `.gitignore` for secrets (`.env*`, `*.pem`), `CODEOWNERS`, and a documented GitHub Flow branching policy.
- A thoughtful, well-sourced literature review and a clear, defensible rule-based modeling rationale in the paper.

---

## 12. Suggested Prioritized Action Plan

**Before the oral defense / before calling anything "done":**

1. 🔴 Fix SRID `4324`→`4326` (code) and re-verify; correct the CHANGELOG claim. _(§2.1)_
2. 🔴 Pick the energy model; make paper + ARCHITECTURE/DATABASE/TESTING + `voltph-ev-physics` agree. _(§2.2, §10.1)_
3. 🔴 Decide Supabase vs Railway DB; fix all three documents + `railway.json`. _(§2.3)_
4. 🟠 Fix paper FR numbering & scope contradiction (FR-03/05/09/10), table numbering, front-matter placeholders, tense. _(§9.1–9.5)_
5. 🟠 Add a status caption ("Planned") to any doc/diagram describing unbuilt flows, or build a first real pass of `/api/trips/optimize`. _(§2.5, §6.2)_

**During the build sprints:** 6. 🟠 Add CI (`.github/workflows/ci.yml`), `synchronize:false` + migrations, auth + security middleware, and zod validation at routes. _(§3, §5, §7.1, §2.4)_ 7. 🟠 Implement the rule-based model in `packages/shared`, TDD it, then set coverage gates. _(§6)_ 8. 🟡 Align frontend to the documented data-fetching standard; wire real model IDs; build out mobile screens. _(§8)_ 9. 🟢 Cleanup: remove tracked `.DS_Store`, dedupe `.gitignore`, resolve the stray `voltph-ui-ux.skill` zip, pin Node via `engines`/`.nvmrc`, migrate `turbo.json` to `tasks`. _(§7.5, §7.6, §7.4, §7.2)_

---

_End of review. No source files, documentation, the Capstone paper, or skills were modified. Awaiting direction on which items to implement._
