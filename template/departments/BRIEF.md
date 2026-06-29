# Brief: departments/

Procedure for the `departments/` zone. Read before adding a department article.

**Goal:** one area per business function (sales, marketing, product, operations) — its goals,
processes and facts. In a solo-founder + agents company these are *functions*, not headcount.
**Belongs here:** how a function works, its playbooks, KPIs, recurring processes. **Does NOT belong:**
a specific product (→ `projects/`), reusable lessons (→ `concepts/`).

## How to add (procedure)
1. **Dedup first** (search by meaning; update in place if it already exists).
2. Copy `_templates/department.md`. File = `departments/<department>/<slug>.md` (group by function).
   Set `type` (e.g. Reference / Department / Playbook). Configured departments: see
   `knowledge.config.json` → `departments`.
3. Write a concrete one-sentence `summary`; set `category: departments/<name>`. Add `source` + `authority`
   when the content has a clear origin.
4. Link via `[[slug]]`; mark unknowns with a flag. Run reindex; log one line.

## Required frontmatter
`title, slug, category: departments/<name>, type, summary, tags, status, author, created, updated`.
