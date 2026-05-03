# Onboarding Plan for Junior Developers 👶🚀

![Onboarding](https://img.shields.io/badge/onboarding-v1.0.0-green)

Welcome to the VoltPH team! This guide will help you get up to speed with our codebase and development workflow.

## 🏁 Phase 1: Environment Setup (Day 1)
- [ ] Install **Node.js** (LTS version).
- [ ] Install **Docker Desktop** (for running PostgreSQL/PostGIS locally).
- [ ] Set up **VS Code** with recommended extensions:
  - ESLint, Prettier, Tailwind CSS IntelliSense (if applicable), Turbo Console Log.
- [ ] Clone the repo and run `npm install`.
- [ ] Run `npm run dev` and verify you can access the Web app (localhost:5173) and API (localhost:3001).

## 📚 Phase 2: Knowledge Base (Week 1)
- [ ] **Monorepo Architecture:** Read about [Turborepo](https://turbo.build/repo/docs).
- [ ] **TypeScript:** Familiarize yourself with our shared types in `packages/shared`.
- [ ] **PostGIS:** Understand basic spatial queries like `ST_DWithin`.
- [ ] **React Native:** Explore the `apps/mobile` directory and Expo documentation.

## 🛠 Phase 3: First Tasks (Week 1-2)
- [ ] **Task 1: Bug Fix/Small Feature.** Add a new field to the `EVModel` entity and update the frontend to display it.
- [ ] **Task 2: Testing.** Write a unit test for a utility function in the `shared` package.
- [ ] **Task 3: Documentation.** Update the `TECH_STACK.md` if you find any missing details during your setup.

## 🤝 Code Review Guidelines
- We use **Pull Requests (PRs)** for all changes.
- Ensure your code passes `npm run lint` before committing.
- Every PR must be reviewed by at least one senior developer.

## 🆘 Getting Help
- Check the `#dev-questions` channel on Slack.
- Refer to the [Technical Stack](./TECH_STACK.md) and [Architecture](./ARCHITECTURE.md) documents.
- Don't hesitate to ask for a 1-on-1 pairing session!
