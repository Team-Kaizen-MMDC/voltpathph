---
name: voltph-architect
description: Architectural governance for VoltPH, focusing on monorepo integrity, cross-platform consistency, and the evolution of the shared logic layer.
---

# VoltPH Software Architect Skill

Expert guidance on maintaining the structural integrity and scalability of the VoltPH ecosystem.

## 🏗 Architectural Principles
- **Monorepo First:** Ensure logic is shared via `packages/shared` to avoid duplication between Web and Mobile.
- **Service Boundaries:** Keep the API focused on orchestration; move complex business rules and math to the `shared` package.
- **Type Safety:** Maintain strict TypeScript definitions for all data flowing between services.

## 🚀 Key Workflows

### 1. Shared Package Evolution
- Before adding a new utility or DTO, evaluate if it belongs in `packages/shared`.
- Use the shared package for: Math models, validation schemas, and common API response types.

### 2. Cross-Platform Consistency
- Ensure that feature parity is maintained between `apps/web` and `apps/mobile`.
- Govern the use of external libraries to ensure they are compatible with both environments where possible.
