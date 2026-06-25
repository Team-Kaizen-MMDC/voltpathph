#!/usr/bin/env node
/**
 * Engine-agnostic Compose runner for local infrastructure.
 *
 * Resolves a Compose command, preferring Docker and falling back to Podman, then
 * forwards all arguments to it against the repo-root `docker-compose.yml`.
 *
 * Resolution order:
 *   1. `docker compose`      (Docker Compose v2 — preferred)
 *   2. `podman compose`      (Podman 4.1+ built-in compose)
 *   3. `podman-compose`      (standalone Python tool)
 *   4. `docker-compose`      (legacy standalone v1)
 *
 * Usage: node scripts/compose.mjs <args...>   e.g. `up -d`, `down`, `logs -f db`
 */
import { spawnSync } from "node:child_process";

/** Returns true if `cmd args` runs and exits 0 (used to probe availability). */
function ok(cmd, args) {
  try {
    return spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
  } catch {
    return false;
  }
}

function resolveCompose() {
  if (ok("docker", ["compose", "version"])) return ["docker", ["compose"]];
  if (ok("podman", ["compose", "--help"])) return ["podman", ["compose"]];
  if (ok("podman-compose", ["--version"])) return ["podman-compose", []];
  if (ok("docker-compose", ["--version"])) return ["docker-compose", []];
  return null;
}

const resolved = resolveCompose();
if (!resolved) {
  console.error(
    "No container engine found. Install Docker or Podman to run the local DB:\n" +
      "  • Docker:  https://docs.docker.com/get-docker/\n" +
      "  • Podman:  https://podman.io/docs/installation  (plus `podman compose` or `podman-compose`)",
  );
  process.exit(1);
}

const [bin, baseArgs] = resolved;
const args = [...baseArgs, ...process.argv.slice(2)];
console.log(`> ${bin} ${args.join(" ")}`);
const run = spawnSync(bin, args, { stdio: "inherit" });
process.exit(run.status ?? 1);
