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

## Step 2 — First decide: NEW base or JOIN an existing one? (this gates everything)
Ask directly: "Does anyone at your company already use this knowledge base? If so — paste the link they sent you."

### A) JOIN (there's a link) — inherit, don't re-ask
The company already set this up. Download the base into `~/knowledge/<slug>`. The base's config already
holds the company name, departments and the **writing language** (`company.language`) — **inherit them
as-is. Do NOT ask the joiner about language, departments or company name.** The only thing you still
need is who they are (Step 3). (If the downloaded base is empty — no `knowledge.config.json` — treat it
as NEW, path B.)

### B) NEW base (no link / first person) — ask the few setup questions
Ask for: (1) the **company name**, and (2) **"In which language do you want to write entries into the
knowledge base?"** — this becomes the company default (`company.language`) that everyone who joins later
inherits. (The interface/structure stays English regardless.) Then create the base:
- if `gh` is logged in → create a private base: `gh repo create <user-or-org>/<slug>-knowledge --private`, connect and stamp with the template;
- if not → create the base locally and explain that for now it lives on their computer, and you'll connect it to the company when they're ready.
- Departments: keep the template defaults unless they want to change them.

Template to stamp from: `${CLAUDE_PLUGIN_ROOT}/template/` (skip `INDEX.md` and `kb-data.js`). If the variable is empty — use `template/` from the `knowledge-os` repo.

## Step 3 — Who you are (personalization) — both paths
Ask for their full name and what they do at the company. Create `people/<handle>.md` from the
`_templates/person.md` model, filling in the role, and add their git email → handle to the `roster` in
`knowledge.config.json` (so their entries are attributed to them). Explain simply: "this way the
assistant is tailored to you". (Their entries default to the base's `company.language`; they may still
write in their own language if they prefer — mixed languages are fine.)

## Step 3b — NEW base only: seed the core context
For a NEW base, fill `CONTEXT.md` from what you already learned (owner name, company, the writing
language, and 1–2 sentences on goals / how to work with them), and leave `now.md` for them to fill with
this week's focus. (On a JOIN these already exist — don't touch them.) This gives the assistant strong
standing context from day one.

## Step 4 — Tidy up and save
Set `knowledge.config.json`: for a NEW base fill `company.name`, `company.slug`, `company.language`
(from Step 2), the shared-base address if any, and set `version` to the installed plugin version (read
`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`; fall back to the template's value); for a JOIN leave
the inherited values alone. Run `node scripts/reindex.mjs`. Register the base globally (quietly):
`node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --base ~/knowledge/<slug>`.
If you created a new shared base connected to the company — make the first save (`git add/commit/push`),
in human terms: "I'm saving the base to the company so the rest of the team can access it".

## Step 5 — Show the result and teach what's next
- Open the base viewer: `open ~/knowledge/<slug>/viewer.html`. Say: "this is your window into all the company's knowledge".
- Explain in plain language: ask questions → `/kb-query`; find something specific → `/kb-find`; add knowledge → drop a note and ask to save it (`/kb-ingest`); start a new project → `/kb-new-project`; pull the team's updates → `/kb-sync`.
- Congratulate them — the base is ready. Summarize briefly and in human terms what was done.
