---
description: Odpowiedz na pytanie z bazy wiedzy — czytaj INDEX, otwieraj tylko trafne pliki.
argument-hint: <pytanie>
allowed-tools: Read, Glob, Grep, Bash
---

# /kb-query — pytanie do bazy

Pytanie: `$ARGUMENTS`

1. Przeczytaj `INDEX.md`. Nie ładuj wszystkich artykułów — to psuje cały sens systemu.
2. Na podstawie `summary` i `tags` wytypuj 1–5 trafnych artykułów i otwórz tylko je. Jeśli dotyczą folderu z `BRIEF.md` — zerknij też do briefu po kontekst i hierarchię źródeł.
3. Jeśli trzeba pogłębić — idź po linkach `[[…]]` do powiązanych.
4. Odpowiedz zwięźle, podając źródła jako linki do plików (np. `dzialy/sprzedaz/proces-sprzedazy.md`). Gdy artykuły mają `authority`, waż je — `primary` przed `secondary`/`derived` — i zaznacz, jeśli opierasz się na słabszym źródle.
5. Jeśli widzisz sprzeczność między artykułami — zasygnalizuj ją (nie zgaduj), ewentualnie odeślij do `/kb-lint`.
6. Jeśli baza nie ma odpowiedzi — powiedz to wprost i zaproponuj `/kb-ingest`.
