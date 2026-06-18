---
description: Create a new company knowledge base or connect an existing repo. Use when the user says e.g. "create/set up a knowledge base", "connect a knowledge repo", "new base for the company".
argument-hint: [company-slug] [repo-url (optional)]
allowed-tools: Bash, Read, Write, Edit
---

# /kb-init — create or connect a knowledge base

Arguments: `$ARGUMENTS` (e.g. `acme` or `acme git@github.com:acme/knowledge.git`)

Goal: prepare an independent company knowledge base in `~/knowledge/<slug>`. Each company = a separate repo.

Steps:
1. Determine the company `slug` (1st argument; if missing — ask). Target directory: `~/knowledge/<slug>`.
2. The template ships with the plugin in `${CLAUDE_PLUGIN_ROOT}/template-en/`. If the variable is empty (running from a clone, not an install), use `template-en/` in the `knowledge-os` repo.
3. If a repo URL is given (2nd argument):
   - `git clone <url> ~/knowledge/<slug>`.
   - If the repo is empty or has no `knowledge.config.json` → stamp it with the template (step 4).
   - If it already has a base → skip stamping, go to step 6 (connect to existing).
   Without a URL: create the directory and stamp it with the template.
4. Stamp: copy the template contents into the base directory. Do not copy the generated `INDEX.md` or `kb-data.js`.
5. Fill in `knowledge.config.json`: `company.name`, `company.slug=<slug>`, `remote=<url>` if any; adjust the `departments` list.
6. Ask for your handle and role → create `people/<handle>.md` from the `_templates/person.md` model. Set `external: true` if you are deploying as an external consultant.
7. Run `node scripts/reindex.mjs` in the base directory.
8. Register the base globally so the agent in EVERY project knows it exists: `node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --base ~/knowledge/<slug>` (writes a registry + a pointer into each tool's global instructions). Optionally install the universal auto-reindex: `node scripts/reindex.mjs --install-git-hook`.
9. Show: the base path, the article count, the command to open `viewer.html` (e.g. `open ~/knowledge/<slug>/viewer.html`).

Do not commit automatically — that is what `/kb-deploy` is for.
