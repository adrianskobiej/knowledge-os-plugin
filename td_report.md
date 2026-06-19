# Technical Debt Assessment — knowledge-os

**Date:** 2026-06-19 · **Scope:** full project (34 git-tracked files) · **Model:** 12-dimension weighted rubric (debt %, lower is better)

## Verdict

| Metric | Value |
|---|---|
| **Debt score** | **31.25 %** |
| **Band** | **Moderate** — noticeable drag; plan a paydown |
| Red flags | Tests (no automated tests) |

knowledge-os is a small, genuinely well-crafted tool (~700 LOC of code across 4 files, plus a Markdown content template). The architecture is clean, coupling is loose, duplication is near-zero, and documentation is strong. The score lands in *Moderate* almost entirely on one axis: **there are no automated tests**, which carries the model's heaviest weight (15) and is risky for code that generates HTML and writes into users' global config files. Fix that and the project drops comfortably into *Good*.

> Confidence note: complexity, coupling and duplication figures here are static **proxies** plus a manual code read, not output from dedicated tools (radon/jscpd/madge). For a small codebase this is reliable; the test/build gaps are factual (absence of files), not proxies.

## Score by dimension

Grade 0–4 (4 = exemplary). `debt_pts = weight × (4 − grade) / 4`. Total debt = Σ debt_pts ÷ Σ weights × 100.

| # | Dimension | W | Grade | Debt pts | Notes |
|---|---|--:|:--:|--:|---|
| 5 | Tests | 15 | ▰▱▱▱▱ 0 | 15.00 | **No automated tests.** No `package.json`, test runner, or CI. `--lint` validates *content*, not *code*. HTML generation (XSS-sensitive) and global-file writes are untested. |
| 1 | Architecture & modularity | 12 | ▰▰▰▱▱ 3 | 3.00 | Clean "one source of truth → per-tool adapter" pattern; files are single-purpose. But `reindex.mjs` is a 304-line do-everything file (walk + frontmatter + md→HTML + lint + quote-protection + index/data gen). |
| 2 | Code complexity | 10 | ▰▰▰▱▱ 3 | 2.50 | `install.mjs` is flat and readable. `reindex.mjs` / `viewer.html` nest ~8–9 deep; dense multi-statement one-liners and a branchy `mdToHtml` reduce readability. |
| 4 | Module coupling | 10 | ▰▰▰▰▰ 4 | 0.00 | Loose by design: modules communicate via generated artifacts (`INDEX.md`, `kb-data.js`) and conventions, with near-zero internal imports. |
| 3 | Duplication | 8 | ▰▰▰▰▰ 4 | 0.00 | Negligible. No repeated logic blocks across tracked code. (The untracked `.claude/worktrees/` copies don't count.) |
| 6 | Data model | 8 | ▰▰▰▱▱ 3 | 2.00 | Explicit frontmatter schema (`REQUIRED` fields, `authority` enum, statuses), plus slug-uniqueness, dead-link and orphan checks. Config-driven. |
| 7 | Error handling | 7 | ▰▰▰▱▱ 3 | 1.75 | Silent catches are intentional and documented (the hook must never block; optional reads fall back to defaults). `install.mjs` global writes lack try/rollback. |
| 10 | Build & deployment | 7 | ▰▰▰▱▱ 3 | 1.75 | Zero-dependency pure Node, cross-platform, with `--dry-run`. But no `package.json` → no engine pin, no lockfile, no standard manifest. |
| 9 | Documentation | 7 | ▰▰▰▰▰ 4 | 0.00 | Strong: README, START-HERE, root + template `AGENTS.md`, per-file intent comments, rich command descriptions. Handoff-ready. |
| 8 | Logging & observability | 6 | ▰▰▰▱▱ 3 | 1.50 | Clear CLI output (✓/⚠/✗ markers), `--dry-run`, lint counts. Appropriate for a CLI; no structured logging (not needed here). |
| 11 | Regression risk | 5 | ▰▰▱▱▱ 2 | 2.50 | No test safety net, and it regex-injects "managed blocks" into users' **global** instruction files — fragile and easy to break silently. |
| 12 | Change safety / rollback | 5 | ▰▰▰▱▱ 3 | 1.25 | Git-tracked, small commits, `--dry-run`. But it mutates files **outside** the repo (`~/.claude/CLAUDE.md`, etc.) with no uninstall/rollback command. |
| | **Total** | **100** | | **31.25** | **Debt = 31.25 % → Moderate** |

## Red flags

- **No automated tests (dimension 5).** The single largest contributor (15 of 31.25 debt points). The riskiest untested surfaces are the `mdToHtml`/`inline`/`safeUrl`/`esc` rendering path (security-relevant: it builds HTML and is the XSS boundary) and `install.mjs`'s mutation of global instruction files.

No other dimension scored below the red-flag threshold. Architecture, data model, error handling and change safety — the dimensions static analysis judges weakest — were all manually graded and are healthy here.

## Ranked paydown plan

Ordered by how many debt points each lever can remove if taken to exemplary.

1. **Add automated tests (−11.25 pts to reach grade 3, −15 to reach 4).** Highest-leverage move by far. Start with `reindex.mjs`: feed a fixture base, assert generated `INDEX.md`/`kb-data.js`, and add explicit XSS cases for `safeUrl`/`esc`/`inline` (`javascript:` URLs, `</script>` in content, attribute-breakout quotes). Add a smoke test for `install.mjs --dry-run`. A `package.json` with `node --test` (built-in, keeps the zero-dep ethos) plus a minimal GitHub Actions workflow covers tests, build manifest, and CI at once.
2. **Split `reindex.mjs` (−3 pts, architecture).** Extract the Markdown→HTML renderer into its own module; this also makes it independently testable and de-nests the file.
3. **Reduce complexity in the renderer (−2.5 pts).** Once extracted, break `mdToHtml`'s line loop into smaller block handlers.
4. **Lower regression risk (−2.5 pts).** The test suite above is most of this; additionally, snapshot the managed-block injection regex against a few real-world global files.
5. **Smaller wins (−1.25 to −2 pts each):** add an `uninstall`/rollback path to `install.mjs` (change safety); add a `package.json` engines field + lockfile (build); wrap global writes in error handling with a partial-failure summary (error handling).

## Track over time

Re-running this same model after the test suite lands should move the score from **31.25 % (Moderate)** toward **~16 % (Good)** — adding tests at grade 4 alone removes 15 points. Commit successive `td_report.md` files (e.g. under `docs/tech-debt/`) so the trend is auditable. The number is comparable only as long as the weights above are unchanged.
