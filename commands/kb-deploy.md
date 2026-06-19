---
description: Save and push your knowledge changes to the company repo. Use when the user says e.g. "publish/send the changes", "save the base for the team", "commit and push the knowledge".
argument-hint: [change description (optional)]
allowed-tools: Bash, Read
---

# /kb-deploy — deploy changes to the company

Goal: publish your additions to the shared base and integrate teammates' work in the
same pass, so nothing is lost and the push never gets rejected.

1. Determine the base directory (nearest ancestor with `knowledge.config.json`).
2. `node scripts/reindex.mjs --lint`. If there are serious warnings (dead links, missing `summary`) — show them and ask whether to continue anyway.
3. `git add -A` (the generated `INDEX.md` and `kb-data.js` are in .gitignore — they won't enter the commit).
4. `git commit` with the description from the argument or a concise one generated from the diff. End the commit message with the footer:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
5. If the base has a remote, integrate the team's changes first so your push is additive and never rejected: `git pull --rebase --autostash`.
   - On a conflict (only if the same file was edited by two people): STOP, report the file(s), let the human resolve, then `git rebase --continue`. Never discard or force.
6. `git push`. If there is no remote — explain that the base is local, and show how to add a remote (`git remote add origin <url>`).
7. Report what was pushed (and anything that came in during the rebase).
