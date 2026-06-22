# AGENTS.md — knowledge base (knowledge-os)

> Every AI assistant (Claude Code, Codex, Antigravity, Cursor…) reads this file when it
> opens this directory. It describes what this base is and how to work with it — with no
> tool-specific install. The `/kb-*` commands are just convenient shortcuts for the
> procedures below; if your tool doesn't have them, run the steps by hand.

## What this is

A company knowledge base. The source of truth is `.md` files with frontmatter in:
`departments/`, `projects/`, `people/`, `concepts/`. From them we generate:
- `INDEX.md` — a lightweight index (one line/article). **Read it FIRST.**
- `kb-data.js` — data for `viewer.html` (the human-facing reader, offline).

Both files are generated and in `.gitignore` — never edit them by hand.

## What goes here (and what does NOT)

This holds ONLY distilled knowledge (.md): decisions, processes, facts, people, lessons.
It is NOT a project store. Never copy project source code, whole files, or repositories
here. Projects stay where they are (scattered across disk) — you only SAVE knowledge from
them into this base. Do the work in the project's own folder; save the knowledge here.

Safety by default: the base uses a whitelist `.gitignore` — everything is ignored unless
explicitly allowed. Only the knowledge zones are shared; stray files and the raw source in
`raw/` stay local and are never pushed. Leaking something requires an explicit edit.

## Golden rule for the assistant

Don't load the whole base into context. Read `INDEX.md`, use `summary`/`tags` to pick
1–5 relevant articles and open only those; go deeper by following `[[slug]]` links.

## Workflow (procedures = /kb-* commands)

- **Query** (`/kb-query <question>`): read `INDEX.md` → open the relevant articles →
  answer concisely, citing file paths. Weigh `authority` (`primary` > `secondary` >
  `derived`). Surface contradictions, don't resolve them.
- **Add knowledge** (`/kb-ingest [path|topic]`): read the raw material from `raw/`, check
  `INDEX.md` and the target folder's `BRIEF.md`, write article(s) `.md` with full
  frontmatter (models in `_templates/`), link via `[[slug]]`, then run reindex.
- **Health-check** (`/kb-lint`): `node scripts/reindex.mjs --lint` — missing fields, dead
  links, orphans, duplicates, protected-quote signals.
- **Sync** (`/kb-sync`): `git pull --rebase --autostash` → reindex (integrates teammates' work without losing yours).
- **Deploy** (`/kb-deploy`): reindex --lint → `git add -A` → commit → `git pull --rebase --autostash` → push.

## Engine commands (work in every tool)

```
node scripts/reindex.mjs                 # rebuild INDEX.md + kb-data.js
node scripts/reindex.mjs --lint          # health-check only, no writes
node scripts/reindex.mjs --bless-quotes  # approve protected quotes (quotes.json)
node scripts/reindex.mjs --install-git-hook  # universal auto-reindex (commit/pull/checkout)
```

After every change to `.md` articles, run `node scripts/reindex.mjs` so `INDEX.md` and the
viewer stay fresh. (Claude does this automatically via a hook; other tools — via the git
hooks from `--install-git-hook`, or manually.)

## How to add knowledge well

1. Required frontmatter: `title`, `slug`, `category`, `summary`, `status`, `author`. Model in `_templates/`.
2. `summary` = one concrete sentence (the only thing the assistant sees in the index).
3. Granularity (file vs row): if the thing has its own lifecycle — updates independently, has its own owner/ID, someone may need only it — give it its own `.md`. If it's a small annotation, make it a row/section inside a parent article. Don't shard trivia; don't bury independent things.
4. Quality filter: keep only what passes "would an LLM querying this in 6 months actually use it?". Record facts with their source; mark hypotheses/assumptions as such; drop paraphrase, speculation, raw code, secrets.
5. Transcribe first: turn screenshots / diagrams / charts into text before saving — the base is text the LLM reads.
6. Provenance (optional): `source` + `authority` (`primary`/`secondary`/`derived`) per the folder's `BRIEF.md`.
7. Link liberally via `[[slug]]`.
8. Human-in-the-loop: propose the article (path + content) and get an explicit OK before writing. Outsource the thinking, not the understanding.
9. Open `viewer.html` to browse the base like a human.

## Identity, decisions & history (shared base)

- Author from Git, no second source of truth: your author slug comes from `git config user.email` mapped via `roster` in `knowledge.config.json`. Stamp it as `author:` in each article you add, so the file's author matches the commit's author. If your email isn't in the roster, add it.
- `wiki/decisions.md` — append-only log of decisions that shape the base or how the team works (D-NNN: who, decision, why, consequences). Never edit past entries.
- `wiki/log/log-<slug>.md` — your personal append-only activity log; add one line per change. Everyone writes only to their own file → no merge conflicts.
