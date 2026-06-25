---
name: voltph-capstone-paper
description: Maintains the Voltpath PH Capstone academic paper (docs/MO-IT200D1 ... Paper.md). Use when editing the paper for APA 7 citations, sequential table/figure numbering, FR/NFR cross-reference integrity, proposal tense, front-matter completeness, and keeping the paper consistent with the codebase and docs.
---

# Voltpath PH Capstone Paper Skill

The Capstone paper is the project's central deliverable and is read closely by a panel. This skill enforces academic and internal-consistency standards. The general technical-docs skill is `voltph-docs-engineer`; this one is paper-specific.

## 📐 Internal consistency (panel will check these)

- **Tables & figures numbered sequentially** (Table 1…N, Figure 1…N). Every in-text reference ("see Table 2") must match the label on the table it points to. Known issue: a route table labeled "Table 1" is referenced as "Table 2"; numbering jumps 1,2,3,4,…,7; the Sprint/Technologies tables are unnumbered.
- **FR/NFR cross-references must resolve.** Never cite an FR/NFR ID that the requirements table doesn't define. Known issue: text references "FR-01 through FR-10" and an "FR-10" feature, but the table defines only FR-01–FR-08 with FR-03/FR-05 struck through.
- **Scope coherence.** If an FR is dropped (e.g. struck-through FR-03 Energy-Efficient Routing, FR-05 Real-Time Traffic), reconcile the title, Research Objectives, Research Questions, Methodology phases, and Testing — don't leave the scope self-contradictory.
- **One tech-stack story.** The DB host must be stated identically everywhere (Supabase **or** Railway, not both). Mirror whatever `voltph-devops` / the code settle on.
- **Energy model = rule-based** (`E = Ebase × Wtraffic × Welevation × Wtemperature`). Do not describe a physics force-model as the system's method (see `voltph-ev-physics`).

## 🕰 Tense & framing (Capstone 1 = proposal)

- Use **future/conditional** tense for planned work ("will be conducted", "is designed to"). Don't assert results not yet gathered ("verified across Android and iOS", measured MAPE). Keep results sections clearly prospective.

## 📚 APA 7 citations

- In-text `(Author, Year)`; every in-text citation has a matching References entry and vice-versa.
- References: italicize journal/source titles, include volume(issue), DOIs as `https://doi.org/...`.
- Any system reviewed in Methodology (e.g. ABRP) must first appear in the Review of Related Literature, or be removed.

## 🧾 Front matter & formatting

- Populate **List of Tables / Figures / Appendices** and the **Table of Contents** with real titles + page numbers before submission (no "Name of Table 1 … page #" placeholders).
- Fix Markdown-export artifacts: stray escapes (`2022\.`, `11697\)`, `\<...\>`), and standardize the formula notation (consistent `×`, subscripts `W_traffic`).
- Standardize names/branding: "Glenn Baluyot" (not "Glen"), "Voltpath PH" (not `VoltPH`/`VoltPath`).
- Include required appendices: prototype/output link and the **Disclosure of AI Tools Used**.

## ✅ Before declaring the paper "ready"

1. Every table/figure referenced exists and is numbered correctly.
2. Every FR/NFR/citation cross-reference resolves.
3. Tense is consistent with a proposal.
4. Tech-stack, energy-model, and brand-list claims match `docs/*`, `skills/*`, and the code.
5. Front matter and appendices are complete.
