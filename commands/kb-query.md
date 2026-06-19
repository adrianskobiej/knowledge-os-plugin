---
description: Answer a question using the company knowledge base. Use when the user asks e.g. "what do we know about…", "check the base", "look it up in our knowledge", "do we have anything on…". Reads INDEX and only the relevant articles.
argument-hint: <question>
allowed-tools: Read, Glob, Grep, Bash
---

# /kb-query — ask the base

Question: `$ARGUMENTS`

1. Read `INDEX.md`. Don't load every article — that defeats the whole point of the system.
2. Based on `summary` and `tags`, pick 1–5 relevant articles and open only those. If they belong to a folder with a `BRIEF.md` — also glance at the brief for context and source hierarchy.
3. If you need to go deeper — follow the `[[…]]` links to related articles.
4. Answer concisely, citing sources as file links (e.g. `departments/sales/sales-process.md`). When articles have an `authority`, weigh them — `primary` over `secondary`/`derived` — and flag it if you're relying on a weaker source.
5. If you see a contradiction between articles — surface it (don't guess), and optionally point to `/kb-lint`.
6. If the base has no answer — say so plainly and suggest `/kb-ingest`.
