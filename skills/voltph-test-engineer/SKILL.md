---
name: voltph-test-engineer
description: Quality assurance and testing strategies for Voltpath PH, covering unit, integration, and E2E testing across the monorepo.
---

# Voltpath PH Test Engineer Skill

Ensuring the reliability and correctness of the Voltpath PH platform.

## 🧪 Testing Strategy

- **Unit:** the rule-based energy/SoC math in `packages/shared` (see `voltph-ev-physics`).
- **Integration:** API endpoints with a test database + mocked Google Maps SDK (Supertest).
- **E2E:** critical user journeys (planning a trip, finding stations).

## ⚠️ Current reality (keep tests honest)

- Only two trivial tests exist: `apps/api/test/deployment.test.ts` and `apps/web/test/config.test.ts`.
- The modules `TESTING.md` references **do not exist yet**: `packages/shared/src/physics.ts`, `/api/trips/optimize` real logic, `/api/auth/*`. `packages/shared` has no test runner configured.
- Don't claim "≥90% coverage on core calculation modules" until (a) those modules exist and (b) a coverage threshold is configured. Scope `TESTING.md` to what's real; mark the rest "Planned (Sprint 9–10)".

## 🚀 Key Workflows

### 1. Test-Driven for the energy model

- Write failing unit tests with known input/output pairs from the test-drive dataset **before** implementing the formula. Then implement until green.

### 2. Configure coverage gates

- Add `jest --coverage` with a `coverageThreshold` (start realistic, raise toward 90% on `packages/shared`). Add a `test` script + runner to `packages/shared` so `turbo run test --filter=shared` works.

### 3. Running Tests

- `npm test` within an app; `turbo test` (or `npm run test`) across the monorepo.

### 4. Mocking External APIs

- Always mock Google Maps responses in CI to avoid cost and flakiness.
