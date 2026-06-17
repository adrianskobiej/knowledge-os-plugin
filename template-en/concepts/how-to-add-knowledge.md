---
title: How to add knowledge to the base
slug: how-to-add-knowledge
category: concepts
summary: Rules for writing articles, the frontmatter structure and the workflow (ingest → reindex → deploy).
tags: [meta, onboarding, conventions]
status: stable
created: 2026-06-16
updated: 2026-06-16
---

# How to add knowledge to the base

This base is a set of `.md` files. People read them through `viewer.html`, and the LLM reads them through the lightweight `INDEX.md`.

## Rules

1. Every article has frontmatter with fields: `title`, `slug`, `category`, `summary`, `status`. Copy a template from `_templates/`.
2. The summary field matters most — `summary` is the only thing the LLM sees in the index before it decides to open the file. One concrete sentence.
3. Link liberally via `[[slug]]`. Backlinks are built from those links — e.g. see [[sales-process]] or the profile [[anna-smith]].
4. One file = one topic. Several small, linked articles beat one giant one.

## Workflow

- Ingest — drop raw material into `raw/`, ask the agent to compile it into articles.
- Reindex — `node scripts/reindex.mjs` rebuilds `INDEX.md` + `kb-data.js`.
- Deploy — commit + push to the company repo (each company has its own independent repo).

## Health-check

`node scripts/reindex.mjs --lint` flags missing summaries, dead `[[…]]` links and orphans.
