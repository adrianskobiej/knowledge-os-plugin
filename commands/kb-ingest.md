---
description: Skompiluj surowce z raw/ (lub wskazany materiał) w artykuły wiki.
argument-hint: [ścieżka lub temat (opcjonalnie)]
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /kb-ingest — kompilacja surowców do wiki

Materiał: `$ARGUMENTS` (jeśli pusto — przejrzyj katalog `raw/`).

1. Przeczytaj surowiec(e) i zrozum treść.
2. Przeczytaj `INDEX.md`, żeby wiedzieć, co już jest i jakich slugów używać do linków.
3. Przeczytaj `BRIEF.md` docelowego folderu (jeśli istnieje) — cel, odbiorca, hierarchia źródeł. Dopasuj się do niego.
4. Zdecyduj o strukturze: jeden czy kilka artykułów i w którym dziale (`dzialy/`, `projekty/`, `ludzie/`, `koncepty/`).
5. Dla każdego artykułu napisz `.md` z pełnym frontmatterem (wzór w `_szablony/`). Najważniejsze: trafne `summary` w jednym zdaniu + `tags`. Trzymaj zasadę: jeden plik = jeden temat.
6. Proweniencja: gdy znasz pochodzenie, ustaw `source` i `authority` (`primary`/`secondary`/`derived`) — zgodnie z hierarchią z briefu.
7. Linkuj liberalnie do istniejących artykułów przez `[[slug]]`.
8. Jeśli surowiec zawiera dosłowne cytaty do ochrony (zapisy umów, deklaracje klienta) — dopisz je do `quotes.json` i uruchom `node scripts/reindex.mjs --bless-quotes`.
9. Uruchom `node scripts/reindex.mjs`, pokaż wynik + health-check.
10. Zaproponuj przeniesienie/archiwizację przerobionego surowca z `raw/`.
