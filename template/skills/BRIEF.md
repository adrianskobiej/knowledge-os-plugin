# Brief: skills/

Procedure for the `skills/` zone. Read before adding or editing a skill.

**Goal:** one article per reusable agent skill (or the repo that holds them) — what it does, when to
use it, and where it lives.
**Belongs here:** agent/LLM skills and skill repos. **Does NOT belong:** project apps (→ `projects/`),
general lessons/processes (→ `concepts/`).

## How to add (procedure)
1. **Dedup first** (search by meaning; update in place if it already exists).
2. Copy `_templates/skill.md`. One file = `skills/<slug>.md`, slug in kebab-case. Set `type: Skill`.
3. Fill: **What it does · When to use · Trigger · Link/location** (repo · folder · `SKILL.md` path).
4. Add `## How it works` and `## Notes / gotchas`. Link via `[[slug]]`; mark unknowns with a flag.
5. Run `node scripts/reindex.mjs`; log one line in `wiki/log/log-<author>.md`.

## Required frontmatter
`title, slug, category: skills, type, summary, tags, status, author, created, updated`.

## Note
Articles describe skills; the actual skill source lives in its own repo — link to it, don't copy code here.
