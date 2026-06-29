---
description: Set up or connect the company knowledge base, step by step (for non-technical people) — the agent does all the work and leads the user by the hand. Use when the user says e.g. "set up my knowledge base", "install the KB", "connect me to our knowledge base", "get me started with knowledge-os".
allowed-tools: Bash, Read, Write, Edit
---

# /kb-setup — assistant-guided setup (detect first, then lead by the hand)

Your job: get the user onto the company knowledge base with the least possible effort on their side.
You do ALL the technical work. They answer at most a couple of simple questions. Lead, don't quiz.

## Conversation rules (important)
- **Plain language, no jargon.** Don't say "repo / clone / remote / commit" — say "the company's shared
  base", "downloading", "connecting you", "saving".
- **One question at a time.** Never pile up questions. Offer simple numbered choices, not open prompts.
- **Run every command yourself.** Never ask the user to type into a terminal.
- **Never show raw errors.** Explain in human terms what happened and what you're doing next.
- **Confirm before creating anything.** Don't create a new base if one might already exist (Step 0).
- Start with one sentence: what you're about to do and that it takes a moment.

## Step 0 — DETECT first (before asking anything)
A base may already exist on this machine — even if it was set up in a **different app** (Claude Code,
Codex, Antigravity all share one registry). Find it before asking anything:

```bash
node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --list
```
This prints JSON: `bases` (known bases with name/path), `toolsDetected`, `adaptersInstalled` (per tool).
Also glance at your own global instructions — a `knowledge-os` block there already lists registered bases.

- **A base is found** → do NOT create or ask new/join. Say it plainly: *"You already have a knowledge
  base: **<name>** — I'll connect this app to it."* Then **connect the current tool**:
  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/install.mjs"
  ```
  (installs the `/kb-*` commands for every detected tool and refreshes awareness from the registry).
  Confirm who they are if there's no profile for them yet (Step 4), then jump to **Step 7**. Done.
- **No base found** → go to Step 1.

## Step 1 — One friendly question: which situation are you in?
Ask exactly this (numbered choices):
> "Let's find your company's knowledge base. Which is true?
> 1) Someone sent me a **link** to it.
> 2) It's on **another computer or another app**, but not here yet.
> 3) **Nobody uses one yet** — let's start fresh."

- **(1) link → JOIN.** Take the link and download the base (Step 3A).
- **(2) elsewhere → connect/JOIN.** If it's a folder already on *this* computer, point at it:
  `node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --base <path>` then `node …/install.mjs` and you're done
  (Step 7). If it's on another machine/teammate, ask them to grab the **link** from whoever has it, then
  treat as JOIN (Step 3A). Never start a fresh base when one already exists somewhere.
- **(3) fresh → NEW.** Go to Step 3B.

## Step 2 — Check prerequisites (quietly, only what the chosen path needs)
Check `node --version`, `git --version`, and for anything involving the company's shared copy also
`gh --version` + `gh auth status`. Install what's missing if you can (macOS: `brew install node gh`).
For a shared base, the simplest access is GitHub — if not logged in, walk them through `gh auth login`
(browser), calmly. A purely local NEW base needs only node + git.

## Step 3A — JOIN an existing base (inherit, don't re-ask)
Download the base into `~/knowledge/<slug>`. Its config already holds the company name, departments and
the **writing language** (`company.language`) — **inherit them; do NOT ask the joiner about language,
departments or company name.** You only need who they are (Step 4). (If the downloaded folder has no
`knowledge.config.json`, it's empty → treat as NEW, Step 3B.)

## Step 3B — NEW base (first person) — ask the few setup questions
Ask only: (1) the **company name**, and (2) **"In which language should entries be written?"** → this
becomes the company default (`company.language`) everyone who joins later inherits (the interface stays
English). Then create it:
- if `gh` is logged in → private shared base: `gh repo create <user-or-org>/<slug>-knowledge --private`, connect, stamp with the template;
- if not → create it locally and explain it lives on their computer for now; you'll connect it to the company when they're ready.
- Departments: keep the template defaults unless they ask to change them.

Template to stamp from: `${CLAUDE_PLUGIN_ROOT}/template/` (skip `INDEX.md` and `kb-data.js`). If that
variable is empty, use `template/` from the `knowledge-os` repo.

## Step 4 — Who you are (personalization — both paths)
Ask their full name and what they do. Create `people/<handle>.md` from `_templates/person.md` with the
role, and add their git email → handle to `roster` in `knowledge.config.json` (so entries are attributed
to them). Say simply: "this tailors the assistant to you". (Entries default to `company.language`; they
may still write in their own language — mixed is fine.)

## Step 5 — NEW base only: seed the core context
For a NEW base, fill `CONTEXT.md` from what you learned (owner, company, language, 1–2 lines on goals /
how to work) and leave `now.md` for this week's focus. On a JOIN these already exist — don't touch them.

## Step 6 — Save + register everywhere
For a NEW base, set `knowledge.config.json`: `company.name`, `company.slug`, `company.language`, the
shared-base address if any, and `version` from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` (fallback:
template value). For a JOIN, leave inherited values alone. Then:
```bash
node scripts/reindex.mjs
node "${CLAUDE_PLUGIN_ROOT}/install.mjs" --base ~/knowledge/<slug>
```
The second line registers the base so **every tool on this machine** (now and later) knows it exists —
this is what keeps things consistent across apps. For a new shared base, make the first save
(`git add/commit/push`): "I'm saving it to the company so your team can access it."

## Step 7 — Show the result and teach what's next
- Open the viewer: `open ~/knowledge/<slug>/viewer.html` — "this is your window into all the company's knowledge."
- In plain language: ask questions → `/kb-query`; find something → `/kb-find`; save knowledge → drop a note and ask to save it (`/kb-ingest`); start a project → `/kb-new-project`; get the team's updates → `/kb-sync`.
- Congratulate them and summarize, in human terms, what you did.
