# knowledge-os

**A portable company knowledge base that lives in Markdown and works with any AI coding agent.**

Plain `.md` files are the source of truth. A zero-dependency script compiles them into a lightweight index for LLMs and a standalone, offline HTML viewer for humans. Works with Claude Code, Codex, Antigravity — or no agent at all.

🇵🇱 Polish version: [README.pl.md](README.pl.md)

---

## The problem

Company knowledge ends up scattered across wikis, Google Docs, Slack threads and people's heads. Two audiences are usually at odds:

- **Humans** want something nice to read and search.
- **LLMs/agents** choke when you dump a whole wiki into their context — it's slow, expensive, and they miss the relevant bits.

Most tools optimize for one and bolt the other on. And whatever you pick is usually locked to a single editor or AI assistant.

## What knowledge-os does

- **Markdown as the single source of truth.** Every article is a `.md` file with a small frontmatter block. Diff-able, portable, git-friendly, no lock-in.
- **Two compiled views from the same source:**
  - `INDEX.md` — a lightweight index (one line per article) the LLM reads **first**, so it loads only the 1–5 articles that actually matter instead of the whole base.
  - `viewer.html` — a standalone, offline, zero-build HTML reader for people (search, backlinks, dark mode). Double-click to open.
- **Tool-agnostic by design.** The engine is pure Node + a single HTML file. Each base ships an `AGENTS.md` that any agent reads to understand the workflow — so it works the same in Claude Code, Codex, Antigravity, Cursor, or by hand.
- **Wiki-style linking.** `[[slug]]` links build automatic backlinks.
- **"Data room" layer** for contested/changing knowledge: source provenance & authority, per-folder steering briefs, on-demand conflict/gap reports, and code-enforced protected quotes.

## How it works

```
write    → add a .md article (or drop raw notes in raw/ and let the agent compile them)
reindex  → node scripts/reindex.mjs        rebuilds INDEX.md + kb-data.js
read     → open viewer.html (human)  ·  read INDEX.md (LLM)
deploy   → commit + push to your company repo
```

Each company = its own private git repo. This repo is the machinery you stamp new bases out of.

## Quick start

**Requirements:** [Node.js](https://nodejs.org) (that's it — no npm install, zero dependencies).

```bash
git clone https://github.com/<you>/knowledge-os-plugin.git ~/knowledge-os
cd ~/knowledge-os

# create a new knowledge base from the English template
cp -R template-en ~/knowledge/mycompany
cd ~/knowledge/mycompany
git init
node scripts/reindex.mjs            # build INDEX.md + kb-data.js
open viewer.html                    # browse it (macOS; use your OS's open command otherwise)
```

### Use it from your AI agent

Either way works:

1. **No install** — open the base folder in any agent. It reads `AGENTS.md` and runs the workflow.
2. **With `/kb-*` commands** — run the installer once; it detects your tools and installs adapters:

```bash
node install.mjs                 # detect tools, install command adapters
node install.mjs --dry-run       # preview, writes nothing
node install.mjs --tools=codex   # only specific tools (claude,codex,antigravity)
```

| Tool | Commands land in | Auto-reindex |
|---|---|---|
| Claude Code | `~/.claude/commands/` (or install as a plugin) | PostToolUse hook |
| Codex CLI | `~/.codex/prompts/` | git hook |
| Antigravity | `~/.gemini/skills/knowledge-os/` | git hook |
| any other / none | — (use `AGENTS.md`) | git hook |

Tool-agnostic auto-reindex (replaces the Claude-only hook): in a base, run once
`node scripts/reindex.mjs --install-git-hook` — reindex then fires on commit / pull / checkout.

## Repository layout

- `template/` (PL) · `template-en/` (EN) — knowledge-base scaffolds, each with its own `AGENTS.md`, `scripts/reindex.mjs`, `viewer.html`.
- `commands/` · `commands/en/` — slash-command sources (one source of truth `install.mjs` adapts per tool).
- `install.mjs` — cross-platform installer.
- `.claude-plugin/` + `hooks/` — Claude Code plugin + PostToolUse auto-reindex.

## Security

- The Markdown→HTML renderer escapes `& < > " '` and allows only `http`/`https`/`mailto`/anchor/relative URLs in links (`javascript:`/`data:` are dropped to `#`), so compiling untrusted material can't inject script into `viewer.html`.
- `kb-data.js` escapes `</script>` so content can't break out of the data block.
- Auto-reindex runs `scripts/reindex.mjs` from the nearest ancestor that has a `knowledge.config.json` — only edit files inside bases you trust.

## License

[MIT](LICENSE) © Adrian Skobiej
