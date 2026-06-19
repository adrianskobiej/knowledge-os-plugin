---
description: Pull the latest company knowledge and rebuild the indexes. Use when the user says e.g. "update the base", "get the team's changes", "sync the knowledge".
argument-hint: [company-slug (optional)]
allowed-tools: Bash, Read
---

# /kb-sync — synchronize

Goal: pull teammates' additions without ever losing your own. Multiple people share
one base; each article is a separate file, so additions merge cleanly.

1. Determine the base directory: if a slug is given → `~/knowledge/<slug>`; otherwise use the base we're in (nearest ancestor with `knowledge.config.json`).
2. If the base has a remote, integrate remote changes on top of your local work without discarding anything: `git pull --rebase --autostash`.
   - `--autostash` shelves any uncommitted edits and restores them after; `--rebase` replays your local commits on top of the team's.
   - On a merge conflict (rare — only if two people edited the *same* file): STOP, do not force or discard. Report the conflicting file(s) and let the human resolve, then `git rebase --continue`. Never `--abort` away someone's work or `--force`.
3. `node scripts/reindex.mjs` — rebuild `INDEX.md` + `kb-data.js` (they're in .gitignore, so always fresh locally).
4. Report concisely: what came in (a summary of new commits from `git log`), the article count, and health-check warnings if any.
