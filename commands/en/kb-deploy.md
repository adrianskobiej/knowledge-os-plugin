---
description: Save your knowledge to the company repo (reindex + git commit + push).
argument-hint: [change description (optional)]
allowed-tools: Bash, Read
---

# /kb-deploy — deploy changes to the company

1. Determine the base directory (nearest ancestor with `knowledge.config.json`).
2. `node scripts/reindex.mjs --lint`. If there are serious warnings (dead links, missing `summary`) — show them and ask whether to continue anyway.
3. `git add -A` (the generated `INDEX.md` and `kb-data.js` are in .gitignore — they won't enter the commit).
4. `git commit` with the description from the argument or a concise one generated from the diff. End the commit message with the footer:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
5. `git push`. If there is no remote — explain that the base is local, and show how to add a remote (`git remote add origin <url>`).
6. Report what was pushed.
