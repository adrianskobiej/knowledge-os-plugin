---
description: Add/save knowledge to the company base — from a note, document, or raw/ material. Use when the user says e.g. "add this to the knowledge base", "save this entry", "remember this", "capture this". Creates a frontmatter .md article and rebuilds the index.
argument-hint: [path or topic (optional)]
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /kb-ingest — compile raw material into the wiki

Material: `$ARGUMENTS` (if empty — review the `raw/` directory).

1. Read the raw source(s) and understand the content.
2. Read `INDEX.md` to know what already exists and which slugs to use for links.
3. Read the target folder's `BRIEF.md` (if it exists) — goal, audience, source hierarchy. Align with it.
4. Decide on structure: one or several articles, and in which area (`departments/`, `projects/`, `people/`, `concepts/`).
5. For each article write a `.md` with full frontmatter (model in `_templates/`). Most important: an accurate one-sentence `summary` + `tags`. Keep the rule: one file = one topic.
6. Provenance: when you know the origin, set `source` and `authority` (`primary`/`secondary`/`derived`) — per the brief's hierarchy.
7. Link liberally to existing articles via `[[slug]]`.
8. If the raw material contains verbatim quotes to protect (contract clauses, client statements) — add them to `quotes.json` and run `node scripts/reindex.mjs --bless-quotes`.
9. Run `node scripts/reindex.mjs`, show the result + health-check.
10. Propose moving/archiving the processed raw material from `raw/`.
