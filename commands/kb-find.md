---
description: Precise lookup in the knowledge base, especially when it's large. Use when the user asks "find/where is/show me everything about X", references a client/product/person, or you need a specific fact fast. Greps titles/summaries/tags and jumps by tag/entity instead of loading whole indexes.
argument-hint: [term, tag, or entity]
allowed-tools: Bash, Read, Grep, Glob
---

# /kb-find — precise lookup (grep + facets)

Looking for: `$ARGUMENTS`

Don't load whole indexes when you already know what you're after. Two ways, pick what fits:

1. **Free-text** — grep titles/summaries/tags/bodies across the zones:
   ```bash
   rg -i "$ARGUMENTS" */*.md
   ```
   Then open the matching articles (and follow `[[links]]`).
2. **By tag or entity** — open `INDEX-facets.md` and find the row for the tag or entity
   (client / product / person); it lists every article that carries it. Open those.

Then answer concisely, citing file paths. If nothing matches, say so and suggest the closest
zone index (`<zone>/INDEX.md`) to browse. If the lookup revealed a gap, offer to capture it
(`/kb-ingest`).
