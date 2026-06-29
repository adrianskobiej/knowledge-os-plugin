# Brief: meetings/

Procedure for the `meetings/` zone. Read before adding a meeting record.

**Goal:** one article per meeting worth remembering — who met, about what, and the decisions and action
items. Decisions and action items are the point; raw transcripts are not.
**Belongs here:** client/partner/internal meetings with outcomes. **Does NOT belong:** full transcripts
(distil them), trivial syncs with no decisions.

## How to add (procedure)
1. **Dedup first** (a follow-up to an existing meeting may belong as an update, not a new file).
2. Copy `_templates/meeting.md`. One file = `meetings/meeting-<topic>-<YYYY-MM-DD>.md`. Set `type: Meeting`.
3. Fill frontmatter `date` and `attendees` (slugs), plus context/agenda.
4. Capture **Decisions** and **Action items** (`- [ ] action — owner: [[slug]] — due: YYYY-MM-DD`).
5. Keep notes short. Link via `[[slug]]`; mark unknowns with a flag. Run reindex; log one line.

## Required frontmatter
`title, slug, category: meetings, type, summary, tags, status, author, date, attendees, created, updated`.

## Note
A decision that changes how the company/base works also gets a `D-NNN` entry in `wiki/decisions.md`.
