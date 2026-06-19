# Changelog

## 0.2.0

**Rebase-safe team sync — multiple contributors, one base, nobody's entries lost.**

- `/kb-sync` now integrates teammates' work with `git pull --rebase --autostash` instead of `--ff-only`. It replays your local commits on top of the team's and restores uncommitted edits — so syncing never stalls and never discards your changes.
- `/kb-deploy` pulls (rebase) before pushing, so your push is additive and isn't rejected when someone pushed first.
- Conflicts only occur if two people edit the *same* file; in that case the commands STOP for manual resolution and never force or discard. Different articles are different files, so normal additions merge cleanly.
- Generated `INDEX.md` / `kb-data.js` stay git-ignored → zero merge noise.

Workflow recap for a shared private base: each person keeps a local clone, adds knowledge, `/kb-deploy` to push, `/kb-sync` to pull others' additions. Same base from Claude Code, Codex, Antigravity, or Cowork.

## 0.1.0

Initial release.

- Markdown is the source of truth; zero-dependency `scripts/reindex.mjs` compiles a lightweight `INDEX.md` (for LLMs) and a standalone offline `viewer.html` (for humans).
- Tool-agnostic: every base ships an `AGENTS.md`; `install.mjs` installs `/kb-*` command adapters for Claude Code / Codex / Antigravity and sets up cross-project global awareness; git-hook auto-reindex for non-Claude tools.
- `/kb-*` commands with natural-language triggering (`init`, `setup`, `ingest`, `query`, `lint`, `sync`, `deploy`).
- "Data room" layer: source provenance & authority, per-folder briefs, conflict/gap reports, code-enforced protected quotes.
- Security: the Markdown→HTML renderer escapes `& < > " '` and allows only `http`/`https`/`mailto`/anchor/relative URLs (no stored XSS in `viewer.html`); `kb-data.js` escapes `</script>`.
- English-only; MIT licensed.
