# AGENTS.md

Cross-tool agent instructions for Voltpath PH. This file is the vendor-neutral
entry point read by Gemini CLI / Antigravity, opencode, GitHub Copilot, and other
agentic harnesses. **Claude Code** reads [`CLAUDE.md`](./CLAUDE.md).

> **The full project guide lives in [`CLAUDE.md`](./CLAUDE.md) — read it first.**
> It is the single source of truth (commands, architecture, conventions). The
> critical, non-negotiable rules are repeated below so they apply even if only this
> file is loaded.

## Non-negotiable rules

- **Verify your work with the real gates.** From the repo root: `npm test`
  (→ `turbo test`) and `npm run typecheck` must pass. Scope with
  `npm test -- --filter=@voltph/shared`. Don't declare "done" on prose — trust exit
  codes.
- **The energy model is the calibrated scientific core.** `packages/shared/src/energy.ts`
  is rule-based, explainable, and unit-tested. **Propose diffs with rationale; do
  not rewrite it casually or make it nondeterministic.** Spec: `docs/ENERGY_MODEL.md`.
- **Config goes in one place.** `apps/api/src/config.ts` is the _only_ place that
  reads `process.env` / loads dotenv. Add fields there — don't scatter env reads.
- **Preserve graceful degradation.** The stack runs locally with zero external
  secrets (no Google Maps key → haversine fallback; no Supabase JWT secret in
  dev → auth bypass; empty station table → `[]`). New external deps need a local
  fallback.
- **Don't run destructive commands unattended.** Never auto-run `npm run db:reset`,
  `npm run migration:run`/`migration:revert`, or `git push`. Draft migrations
  (`migration:generate`) and let a human apply them.
- **Don't read secrets into context** (`.env`). Keep edits scoped to the relevant
  workspace and show the diff for review.

## Where to look

- Commands, architecture, environment, deployment → [`CLAUDE.md`](./CLAUDE.md)
- Using agentic loops on this repo (prompts, SDLC, headless) → [`docs/AGENT_LOOPS.md`](./docs/AGENT_LOOPS.md)
- Domain docs → `docs/ARCHITECTURE.md`, `ENERGY_MODEL.md`, `DATABASE.md`, `BACKEND.md`, `TESTING.md`
