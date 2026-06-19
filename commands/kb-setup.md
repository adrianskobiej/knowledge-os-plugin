---
description: Set up a knowledge base step by step (for non-technical people) — the agent does it all. Use when the user says e.g. "set up my knowledge base", "help me get started with knowledge-os", "install the base".
allowed-tools: Bash, Read, Write, Edit
---

# /kb-setup — assistant-guided install

Your task: set up a company knowledge base for someone who may be non-technical. You do all the technical work. The user only answers simple questions and maybe clicks "log in" in the browser.

## Conversation rules (important)
- Plain language, no jargon. Don't say "repo / clone / remote / commit" — say "the company's shared base", "downloading", "connecting to the company", "saving".
- Never show raw errors. Explain in human terms what happened and what you are doing next.
- One step = one question. Don't pile them up.
- Run every command yourself. Don't ask the user to type anything into a terminal.
- At the start, say in 2 sentences what you are about to do and that it will take a moment.

## Step 1 — Check what's needed (quietly)
Check: `node --version`, `git --version`, `gh --version`, `gh auth status`.
- Whatever is missing — install it yourself if you can (on macOS `brew install node gh` etc.). If `brew` is missing too — explain simply how to install it and wait.
- `gh` (GitHub) is the simplest way for non-technical people to access the shared base. If not logged in — walk them through `gh auth login` (browser login), calmly explaining each step.

## Step 2 — New base or join an existing one?
Ask directly: "Does anyone at your company already use this knowledge base? If so — paste the link they sent you."
- There's a link → this is a join. Download the base into `~/knowledge/<slug>` (clone it). If the base inside is empty (no `knowledge.config.json`) — stamp it with the template.
- None / new company → ask for the company name. Offer to create a new shared base:
  - if `gh` is logged in → create a private base: `gh repo create <user-or-org>/<slug>-knowledge --private`, connect and stamp with the template;
  - if not → create the base locally and explain that for now it lives on their computer, and you'll connect it to the company when they're ready.
- Template to stamp from: `${CLAUDE_PLUGIN_ROOT}/template/` (skip `INDEX.md` and `kb-data.js`). If the variable is empty — use `template/` from the `knowledge-os` repo.

## Step 3 — Who you are (personalization)
Ask for their full name and what they do at the company. Create `people/<handle>.md` from the `_templates/person.md` model, filling in the role. Explain simply: "this way the assistant is tailored to you".

## Step 4 — Tidy up and save
Fill in `knowledge.config.json` (company name, slug, optionally the shared base address). Run `node scripts/reindex.mjs`. Register the base globally (quietly) so the assistant sees it in every project: `node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --base ~/knowledge/<slug>`. If you created a new shared base connected to the company — make the first save to the company (`git add/commit/push`), saying in human terms: "I'm saving the base to the company so the rest of the team can access it".

## Step 5 — Show the result and teach what's next
- Open the base viewer: `open ~/knowledge/<slug>/viewer.html`. Say: "this is your window into all the company's knowledge".
- Explain in 3 simple sentences: questions → `/kb-query`, adding knowledge → drop a note and ask to save it (`/kb-ingest`), pulling updates from the team → `/kb-sync`.
- Congratulate them — the base is ready. Summarize briefly and in human terms what was done.
