# Brief: concepts/

Procedure for the `concepts/` zone. Read before adding a concept.

**Goal:** one article per portable, reusable piece of knowledge NOT tied to a single project —
lessons learned, processes, playbooks, definitions, decisions-as-knowledge.
**Belongs here:** "how we do X", patterns, reusable lessons, glossary. **Does NOT belong:**
project-specific info (→ `projects/`), skills (→ `skills/`), people (→ `people/`), meetings (→ `meetings/`).

## How to add (procedure)
1. **Dedup first** (search by meaning; update in place if it already exists).
2. Copy `_templates/department.md` (generic article model). One file = `concepts/<slug>.md`.
   Set `type: Concept` (or Reference / Playbook — pick what fits).
3. Write a concrete one-sentence `summary`. Apply the quality filter: "would an agent querying this
   in 6 months actually use it?" Record facts with their `source`; mark hypotheses as hypotheses.
4. Link liberally via `[[slug]]`; mark unknowns with a flag. Run reindex; log one line.

## Required frontmatter
`title, slug, category: concepts, type, summary, tags, status, author, created, updated`.
Optional provenance: `source` + `authority` (`primary` | `secondary` | `derived`).
