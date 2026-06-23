# Changelog

## 0.4.0

- **`/kb-stats` + `reindex --stats`** — base health at a glance: article counts per section and per author, drafts, orphans, and stale articles. Read-only.
- **Stale detection** — `--lint` now flags articles whose `updated` is older than 6 months (knowledge rot).
- **Config validation + louder errors** — `knowledge.config.json` is validated (`roster` must be an object, `departments` an array) and parse failures surface as health-check warnings instead of being silently swallowed.
- **CI hardening** — Node version matrix (18 / 20 / 22) and a separate secret-scan job (`scripts/check-secrets.mjs`, zero-dependency, high-signal patterns).
- **viewer.html** — a "Recently updated" section, search now also matches author + status, and a defense-in-depth CSP meta (blocks `<base>` hijack, plugins/embeds, form exfil).

## 0.3.1

- **Test suite** (`node --test`, zero dependencies) covering the engine (INDEX/kb-data build, author surfacing, XSS sanitization, `</script>` escaping, whitelist `.gitignore`, `--lint`, git-hook install) and the installer (per-tool adapters, Codex frontmatter, idempotent global awareness, `--dry-run`). Run with `npm test`.
- **CI** (GitHub Actions): syntax check + tests + template lint on every push/PR.
- **Hardening:** `viewer.html` now HTML-escapes slugs when building backlink `href`s, closing a narrow DOM-XSS path where a crafted article slug could break out of the attribute (found while writing the tests).

## 0.3.0

Adopted battle-tested ideas from a sibling system (ContextHub):

- **Whitelist `.gitignore`** — the base ignores everything by default and shares only the knowledge zones. Raw source material (`raw/`), stray files, exported data and secrets stay local and can never leak to the remote; sharing requires an explicit edit. Security by default.
- **Sharper ingestion** (`/kb-ingest` + `AGENTS.md`) — entity-granularity rule (own lifecycle → own file, else a row in a parent), the "would an LLM querying this in 6 months actually use it?" filter, facts-with-source, marked hypotheses, transcribe visuals first, and an explicit propose→accept step before writing.
- **Author from Git** — author slug derived from your git email via a `roster` in `knowledge.config.json`, stamped as `author:` in each article and shown in `INDEX.md` + the viewer. File author matches commit author; no second source of truth.
- **Decisions & history** — `wiki/decisions.md` (append-only `D-NNN`: who / decision / why / consequences) and per-person `wiki/log/log-<slug>.md` activity logs (everyone writes only to their own file → no merge conflicts).

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
