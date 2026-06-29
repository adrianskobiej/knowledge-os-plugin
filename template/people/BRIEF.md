# Brief: people/

Procedure for the `people/` zone. Read before adding or editing a person.

**Goal:** one article per person relevant to the company — who they are, their role, expertise, and
(for the owner) goals and how agents should work with them.
**Belongs here:** the owner/primary user, collaborators, clients, contacts. **Does NOT belong:**
sensitive personal data beyond what's needed to work (no ID numbers, no secrets).

## How to add (procedure)
1. **Dedup first** (search by meaning; update in place if the person already exists).
2. Copy `_templates/person.md`. One file = `people/<first-last>.md`, slug in kebab-case. Set `type: Person`.
3. Fill **Role · Department · Contact**, then responsibilities, current focus, expertise, working style.
4. For the **owner/primary user**, also capture company, goals, operating model, stack and how agents
   should help — this is the profile every agent reads first (and seeds `CONTEXT.md`).
5. Set `external: true` for non-team people. Verify facts from a real source; mark unknowns with a flag.
6. Add the person's git email → handle to `roster` in `knowledge.config.json`. Run reindex; log one line.

## Required frontmatter
`title, slug, category: people, type, summary, tags, status, author, external, created, updated`.
