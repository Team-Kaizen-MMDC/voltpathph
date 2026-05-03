---
name: voltph-test-engineer
description: Quality assurance and testing strategies for VoltPH, covering unit, integration, and E2E testing across the monorepo.
---

# VoltPH Test Engineer Skill

Ensuring the reliability and correctness of the VoltPH platform.

## 🧪 Testing Strategy
- **Unit Testing:** Focus on consumption math in `packages/shared`.
- **Integration Testing:** Test API endpoints with a test database.
- **E2E Testing:** Verify critical user journeys (e.g., planning a trip).

## 🚀 Key Workflows

### 1. Running Tests
- Use `npm test` within individual apps.
- Use `turbo test` to run all tests across the monorepo.

### 2. Mocking External APIs
- Always mock Google Maps API responses in CI environments to avoid costs and flakiness.
