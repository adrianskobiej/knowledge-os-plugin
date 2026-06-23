---
description: Precise lookup in the knowledge base, especially when it's large. Use when the user asks "find/where is/show me everything about X", references a client/product/person, or you need a specific fact fast. Greps titles/summaries/tags and jumps by tag/entity instead of loading whole indexes.
argument-hint: [term, tag, or entity]
allowed-tools: Bash, Read, Grep, Glob
---

# /kb-find — search by meaning (grep + facets, no vector DB)

Looking for: `$ARGUMENTS`

Things aren't always written the way they're asked. Search by **meaning** — you are the semantic
engine. Don't match only the literal words:

1. **Expand the query first.** From the user's intent, brainstorm 3–8 synonyms / related terms /
   likely phrasings (the user's language + English). Use the glossary (if present) to map concepts
   to the base's actual terms — e.g. "get clients" → lead-gen, acquisition, prospecting, CRM.
2. **Grep all of them** across the zones, and check `aka:` aliases:
   ```bash
   rg -i "term1|term2|synonym|related" */*.md
   ```
   Or open `INDEX-facets.md` and find the row for a tag/entity (client / product / person).
3. **Open the hits**, judge relevance by meaning, follow `[[links]]`. If a literal grep misses,
   scan the relevant `<zone>/INDEX.md` summaries and reason about which fit — don't stop at a miss.

Then answer concisely, citing file paths. If nothing matches, say so and suggest the closest
zone index to browse. If the lookup revealed a gap, offer to capture it (`/kb-ingest`).
