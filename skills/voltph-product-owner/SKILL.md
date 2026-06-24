---
name: voltph-product-owner
description: Project management and product owner workflows for VoltPH. Use when writing user stories, managing sprints, prioritizing the backlog, or validating features.
---

# VoltPH Product Owner & Sprint Management Skill

Guidance for managing the development lifecycle, writing standard-compliant user stories, and orchestrating sprints for the VoltPH MVP.

## 📋 Backlog Structure & Standards
All user stories must follow the standard format:
- **User Story:** "As a [role], I want to [action], so that [benefit]."
- **Acceptance Criteria:** Must be written as concrete checklists using the **Given-When-Then** structure where appropriate.
- **Estimation:** Use story points (1, 2, 3, 5, 8, 13) representing relative complexity.

## 🏁 Definition of Done (DoD)
A story is only marked as "Done" when:
1.  **Code Quality:** TypeScript code is strictly typed, passes eslint linting, and prettier formatting.
2.  **Architecture:** Core database models are stored in TypeORM, validation schemas are in `packages/shared`, and UI is modular and responsive.
3.  **Testing:** New backend endpoints have integration tests. Physics/math utilities have unit tests.
4.  **Documentation:** Documentation (e.g., BACKEND.md, FRONTEND.md) is updated.
5.  **Review:** PR is reviewed and approved by at least one other team member.
6.  **CI/CD:** Automated builds pass on GitHub Actions.

## 🌳 Release Milestone Strategy
We operate in 2-week sprints over a 12-week timeline (6 sprints total).
- **Milestone 1 (Sprint 1-2):** Core Infrastructure & Geographic Integrity (Fully functional DB migrations, secure authentication, basic maps API routing).
- **Milestone 2 (Sprint 3-4):** The Optimization Engine & Multi-Platform UI (Physics engine calculation, charging station buffer query, web routing, mobile shell maps).
- **Milestone 3 (Sprint 5-6):** Navigation, Caching, Socialization & Launch (Active mobile navigation, offline caching, station reviews, CI/CD deployment automation).
