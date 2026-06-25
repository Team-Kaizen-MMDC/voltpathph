---
name: voltph-docs-engineer
description: Technical documentation management for Voltpath PH, focusing on Markdown, Mermaid diagrams, doc/code consistency, and maintainable project guides.
---

# Voltpath PH Documentation Engineer Skill

Maintaining the clarity and **accuracy** of the Voltpath PH knowledge base.

## 📝 Documentation Standards

- Use **GitHub Flavored Markdown**.
- Include Mermaid diagrams for architecture and process flows.
- Use version and tech-stack badges in primary READMEs.

## ✅ Doc/Code Consistency Mandate (most important)

The project's biggest risk is documentation describing features that aren't built. Before documenting anything as **present/done**:

1. **Verify it exists in code.** If a sequence diagram, schema table, endpoint, or env var isn't implemented, label it **"Planned"** — don't draw it as live.
2. **Verify before claiming a fix.** Grep for the actual change (e.g. `grep -rn 4324`) before writing "Corrected X" in docs or CHANGELOG. A prior CHANGELOG entry claimed the SRID fix while the code still had the bug — never repeat that.
3. **Single source of truth.** When a fact changes (SRID, DB host = Supabase _or_ Railway, energy model, target brand list, FR/NFR IDs), update **all** artifacts together: paper, `docs/*`, `skills/*`, code. Track known divergences in `docs/REVIEW_AND_IMPROVEMENTS.md`.
4. **Match units & names.** kWh/km vs Wh/km; "Glenn" vs "Glen"; `VoltPH` vs `Voltpath PH` — keep them consistent.

## 🚀 Key Workflows

### 1. Updating Diagrams

- Use Mermaid; update `docs/ARCHITECTURE.md` whenever the system design changes, and caption any unbuilt flow as "Planned".

### 2. Onboarding Maintenance

- Keep `docs/ONBOARDING.md` setup steps accurate (e.g. web dev server port, seed command).

### 3. Capstone paper

- For the academic paper specifically, defer to the `voltph-capstone-paper` skill (APA, table/figure numbering, FR/NFR integrity, proposal tense).
