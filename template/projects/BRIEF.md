# Brief: projects/

Procedure for the `projects/` zone. Read before adding or editing a project.

**Goal:** one article per product / app / tool the company builds or runs — what it is, its goal, and
the guardrails agents must respect.
**Belongs here:** apps, products, sites, tools with their own repo/lifecycle. **Does NOT belong:**
project source code or data (stays in the project's own git), one-off lessons (→ `concepts/`),
reusable agent skills (→ `skills/`).

## How to add (procedure)
1. Use the onboarding interview — see `/kb-new-project` in `AGENTS.md`. Don't write an empty stub.
2. **Dedup first** (see "Before adding" in `AGENTS.md`): search by meaning; if it already exists,
   update in place instead of duplicating.
3. Copy `_templates/project.md`. One file = `projects/<slug>.md`, slug in kebab-case.
4. Fill the header: **What it is · Goal · Status · Repo/dir/URL · Stack**. Set `type: Project` (OKF)
   and optional `resource:` (canonical URL/repo).
5. Fill **✅ in-scope** and **⛔ out-of-scope (non-goals)** — non-goals are a HARD boundary.
6. Mark unknowns with a flag (e.g. `⚠ TBD`); never invent. Write in the base's content language.
7. Link relations via `[[slug]]`; run `node scripts/reindex.mjs`; log one line in `wiki/log/log-<author>.md`.

## Required frontmatter
`title, slug, category: projects, type, summary, tags, status, author, created, updated`.
