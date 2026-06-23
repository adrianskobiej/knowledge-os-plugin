---
description: Show knowledge-base health and statistics. Use when the user says e.g. "base stats", "how big is the base", "what's stale", "who added what", "knowledge health".
allowed-tools: Bash, Read
---

# /kb-stats — base health at a glance

1. Determine the base directory (nearest ancestor with `knowledge.config.json`).
2. Run `node scripts/reindex.mjs --stats` (read-only — writes nothing).
3. Present the report clearly: article counts per section, per author, drafts, orphans, and stale articles (`updated` older than 6 months).
4. Turn it into action:
   - Stale articles → propose reviewing/refreshing or archiving them.
   - Orphans → suggest linking them in via `[[slug]]` so they're discoverable.
   - Unattributed articles → suggest stamping `author:` (from the `roster`).
   - Heavy author concentration → flag the bus-factor / knowledge risk.
5. Don't change anything without asking — this is a reporting command.
