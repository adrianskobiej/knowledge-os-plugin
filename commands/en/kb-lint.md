---
description: Health-check the knowledge base and propose fixes.
allowed-tools: Bash, Read, Edit
---

# /kb-lint — consistency check (+ data room)

## A. Structural lint (code)
1. Run `node scripts/reindex.mjs --lint` in the base directory.
2. Interpret the warnings: missing frontmatter/`summary`, dead `[[…]]` links, orphans, duplicate slugs, invalid `authority`, and 🔒 signals about protected quotes (changed since last `--bless-quotes`, paraphrase, missing file).
3. Propose concrete fixes, and apply them once approved. For quotes: if the change was intentional → `node scripts/reindex.mjs --bless-quotes`; if it's a paraphrase in an article → restore the verbatim wording.

## B. "Data room" pass (LLM — collect and flag, don't decide)
4. CONFLICTS — read `INDEX.md` and the briefs, open related articles and find contradictions (e.g. two different prices, conflicting agreements). Write them to `CONFLICTS.md` in the base root: each item = what the contradiction is + which articles + (if any) the `authority`/`source` of each. Don't resolve it — the decision is the human's.
5. MISSING — for folders with a `BRIEF.md`, compare the state of knowledge against the brief's goal and list the gaps in `MISSING.md` in the base root.
6. Finally, rebuild the index: `node scripts/reindex.mjs`. Report the number of conflicts and gaps.

> `CONFLICTS.md` and `MISSING.md` are decision snapshots — regenerated on demand, shared with the team.
