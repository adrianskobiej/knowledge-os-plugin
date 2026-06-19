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
- **Sync** (`/kb-sync`): `git pull --ff-only` → reindex.
- **Deploy** (`/kb-deploy`): reindex --lint → `git add -A` → commit → push.

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

## Article-writing rules

1. Required frontmatter: `title`, `slug`, `category`, `summary`, `status`. Model in `_templates/`.
2. `summary` = one concrete sentence (the only thing the assistant sees in the index).
3. One file = one topic. Link liberally via `[[slug]]`.
4. Provenance (optional): `source` + `authority` per the folder's `BRIEF.md`.
5. Open `viewer.html` in a browser to browse the base like a human.
