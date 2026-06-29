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

- **One base is found** and it's clearly theirs → say it plainly: *"You already have a knowledge base:
  **<name>** — I'll connect this app to it."* Then **connect the current tool**:
  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/install.mjs"
  ```
  (installs the `/kb-*` commands for every detected tool and refreshes awareness from the registry).
  Confirm who they are if there's no profile yet (Step 4), then jump to **Step 8** (show & wrap up). Done —
  they're an existing user, so don't re-run the full onboarding.
- **Base(s) found but they may want another company** (you / a consultant run several companies) → list
  them and ask: *"You already have: <names>. (1) open one of these, (2) join a different company's base
  [link], or (3) set up a NEW base for a different company?"* → (1) connect as above, (2) Step 3A, (3) Step 3B.
  Each company is always its **own separate repo + folder** — never merge two companies into one base.
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
  (Step 8). If it's on another machine/teammate, ask them to grab the **link** from whoever has it, then
  treat as JOIN (Step 3A). Never start a fresh base when one already exists somewhere.
- **(3) fresh → NEW.** Go to Step 3B.

## Step 2 — GitHub access (the base lives in the company's OWN private repo; lead them there)
The company's base belongs in **their own** private GitHub repo, under **their** account or
organization — never anyone else's. Get them there, hand-held. First install what's missing
(`node`, `git`, `gh`; macOS `brew install node gh`), then check `gh auth status`:
- **Logged in** → good. The repo will be created under their account/org (confirm which one).
- **Has an account, not logged in** → walk them through `gh auth login` (browser), calmly, one click at a time.
- **No GitHub account at all** → do NOT silently fall back to local. In plain words: *"GitHub is a free,
  private place to keep your company's knowledge safe online and share it with your team — let's make you
  one, it takes a minute."* Then guide them:
  1. open https://github.com/signup — help pick a username, enter email, verify the code;
  2. (recommended for a company) create a free **Organization** at
     https://github.com/account/organizations/new so the whole team can share the base;
  3. then `gh auth login` (browser) to connect this computer.
- **Genuine last resort** (they can't/won't make an account now) → create the base locally, say it lives on
  their computer for now, and that you'll connect it to GitHub later (just re-run setup) when they're ready.

## Step 3A — JOIN an existing company base (a new employee connecting) — inherit, don't re-ask
A teammate/admin already runs the base; this person just needs to connect to it. Lead them by the hand:
1. **Signed in as themselves.** They need their OWN GitHub account, logged in (`gh auth status`; no
   account → Step 2 to make one). The company base is **private**, so they also need access to it.
2. **Access to the private repo.** Download it into `~/knowledge/<slug>`. **If it fails with a
   permission/authentication error, never show the raw error** — explain plainly: *"This base is private.
   Ask whoever set it up to invite you to the repository (or to the company's GitHub organization). Once
   they do, tell me and I'll connect you."* Then retry after they've been invited.
3. **Inherit, don't re-ask.** The config already holds company name, departments and the writing language
   (`company.language`) — inherit them; do NOT ask the joiner about any of that. You only need who they
   are (Step 4). (Empty folder / no `knowledge.config.json` → it's actually NEW, Step 3B.)
4. **Contributing needs write access.** To save entries back they need push (write) access to the repo. If
   the admin gave them read-only, they can read everything; ask the admin for write access to contribute.

## Step 3B — NEW base (first person) — ask the few setup questions
Ask only: (1) the **company name**, and (2) **"In which language should entries be written?"** → this
becomes the company default (`company.language`) everyone who joins later inherits (the interface stays
English). Then create it:
- if `gh` is logged in → create the company's **own private repo under THEIR account/organization**:
  `gh repo create <their-account-or-org>/<slug>-knowledge --private` (an Organization is best for a team;
  a personal account is fine for one person), connect, stamp with the template;
- if not (local last-resort) → create it locally and explain it lives on their computer for now; you'll
  connect it to their GitHub later when they're ready.
- Departments: keep the template defaults unless they ask to change them.
- (Each company = its own repo + its own `~/knowledge/<slug>` folder. Never put two companies in one base.)

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
this is what keeps things consistent across apps. For a NEW shared base, make the first save
(`git add/commit/push`): "I'm saving it to the company so your team can access it." For a **JOIN (new
employee)**, save just their profile back the same way (`git add/commit/push`) so the team sees they
joined — if that push is rejected, they have read-only access; tell them to ask the admin for write access.

## Step 7 — Get to know them & their work (conversational onboarding — run this AUTOMATICALLY right after the base is ready; don't wait to be asked)
A fresh base is mostly empty — make it useful by learning about the person and their work, in a warm,
natural conversation. Start it yourself the moment setup finishes: *"Your base is ready 🎉 — let me get to
know you and your work for a couple of minutes so I can actually help. Skip anything you like."*
Rules: one question at a time, plain and friendly, everything optional; after each answer, save it
(refine the article in place) and reindex — don't dump it all at once.

**NEW base (owner / first person):**
- **Goals** — what are you working toward (business and personal)? → enrich their `people/` profile + `CONTEXT.md`.
- **Active projects** — what are you building or running? For each one, offer the project interview
  (`/kb-new-project`) so the base starts with real content instead of empty zones.
- **How you like to work** — language, tone, "propose before acting", anything to avoid → profile + `CONTEXT.md`.
- **Current focus** — what's top of mind this week? → `now.md`.

**JOIN (new employee):**
- Lighter — the company context already exists; do NOT redo it or touch `CONTEXT.md`/`now.md`.
- Just enrich **their** `people/` profile: role, expertise / what to ask them about, how they work, and
  optionally what they're working on right now (so teammates know).

If they'd rather skip, that's fine — tell them they can add things anytime with `/kb-ingest` (knowledge)
and `/kb-new-project` (a project), and that `GAPS.md` lists anything left to fill.

## Step 8 — Show the result and wrap up
- Open the viewer: `open ~/knowledge/<slug>/viewer.html` — "this is your window into all the company's knowledge."
- In plain language: ask questions → `/kb-query`; find something → `/kb-find`; save knowledge → drop a note and ask to save it (`/kb-ingest`); start a project → `/kb-new-project`; get the team's updates → `/kb-sync`.
- Congratulate them and summarize, in human terms, what you set up and what you learned about them.
