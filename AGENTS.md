# AGENTS.md — knowledge-os (toolkit repo)

This repo is the **machinery** for stamping out portable company knowledge bases. It is
designed to be **tool-agnostic** — usable from Claude Code, Codex, Antigravity, or any agent.

## Layout

- `template/` (PL) and `template-en/` (EN) — the knowledge-base scaffolds stamped into a new
  base. Each carries its own `AGENTS.md`, `scripts/reindex.mjs`, `viewer.html`.
- `commands/` (Claude PL) and `commands/en/` (Claude EN) — slash-command sources (one source
  of truth that `install.mjs` adapts to other tools).
- `install.mjs` — cross-platform installer; adapts the commands into Claude / Codex /
  Antigravity locations. Run `node install.mjs --dry-run` to preview.
- `hooks/` + `scripts/kb-autoindex.mjs` — Claude-only PostToolUse auto-reindex.
- `.claude-plugin/` — Claude Code plugin + marketplace manifest.

## Invariants — keep these true when editing

- **Engine portability:** `reindex.mjs` and `viewer.html` stay zero-dependency and never
  assume a specific agent. Anything Claude-specific lives in `commands/`, `hooks/`,
  `.claude-plugin/` — not in the engine or templates.
- **PL/EN parity:** a change in one template/command set should be mirrored in the other.
  PL dirs: `dzialy/projekty/ludzie/koncepty/_szablony`; EN: `departments/projects/people/concepts/_templates`.
- **Security:** the Markdown→HTML renderer escapes `& < > " '` and only allows
  `http/https/mailto`/anchor/relative URLs (drops `javascript:`/`data:` to `#`). Don't
  regress this — `viewer.html` injects rendered HTML via `innerHTML`.
- **Generated files** (`INDEX.md`, `kb-data.js`) are git-ignored — never hand-edit.

## Quick checks

```
cd template    && node scripts/reindex.mjs --lint
cd template-en && node scripts/reindex.mjs --lint
node install.mjs --dry-run
```
