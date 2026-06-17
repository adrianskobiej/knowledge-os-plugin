---
description: Pull the latest company knowledge (git pull) and rebuild the indexes.
argument-hint: [company-slug (optional)]
allowed-tools: Bash, Read
---

# /kb-sync — synchronize

1. Determine the base directory: if a slug is given → `~/knowledge/<slug>`; otherwise use the base we're in (nearest ancestor with `knowledge.config.json`).
2. If the base has a remote: `git pull --ff-only`. On a ff conflict — report it and don't force.
3. `node scripts/reindex.mjs` — rebuild `INDEX.md` + `kb-data.js` (they're in .gitignore, so always fresh locally).
4. Report concisely: what came in (a summary of changes from `git log`), the article count, and health-check warnings if any.
