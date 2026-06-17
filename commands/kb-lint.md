---
description: Health-check bazy wiedzy i propozycje poprawek.
allowed-tools: Bash, Read, Edit
---

# /kb-lint — kontrola spójności (+ data room)

## A. Lint strukturalny (kod)
1. Uruchom `node scripts/reindex.mjs --lint` w katalogu bazy.
2. Zinterpretuj ostrzeżenia: braki frontmatter/`summary`, martwe linki `[[…]]`, sieroty, zduplikowane slugi, błędne `authority`, oraz 🔒 sygnały o chronionych cytatach (zmiana od ostatniego `--bless-quotes`, parafraza, brak pliku).
3. Zaproponuj konkretne poprawki, a po akceptacji wykonaj je. Dla cytatów: jeśli zmiana była świadoma → `node scripts/reindex.mjs --bless-quotes`; jeśli to parafraza w artykule → przywróć dosłowne brzmienie.

## B. Pass „data room" (LLM — zbierz i oznacz, nie rozstrzygaj)
4. CONFLICTS — przeczytaj `INDEX.md` i briefy, otwórz powiązane artykuły i znajdź sprzeczności (np. dwie różne ceny, sprzeczne ustalenia). Zapisz je do `CONFLICTS.md` w korzeniu bazy: każda pozycja = na czym polega sprzeczność + które artykuły + (jeśli jest) `authority`/`source` każdego. Nie rozstrzygaj — decyzja należy do człowieka.
5. MISSING — dla folderów z `BRIEF.md` porównaj stan wiedzy z celem briefu i wypisz luki do `MISSING.md` w korzeniu bazy.
6. Na koniec przebuduj indeks: `node scripts/reindex.mjs`. Zaraportuj liczbę sprzeczności i luk.

> `CONFLICTS.md` i `MISSING.md` to migawki decyzyjne — regenerowane na żądanie, współdzielone z zespołem.
