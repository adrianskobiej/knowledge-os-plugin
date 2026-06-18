---
description: Pobierz najnowszą wiedzę firmy i przebuduj indeksy. Użyj, gdy user mówi np. „zaktualizuj bazę", „pobierz zmiany od zespołu", „zsynchronizuj wiedzę".
argument-hint: [slug-firmy (opcjonalnie)]
allowed-tools: Bash, Read
---

# /kb-sync — synchronizacja

1. Ustal katalog bazy: jeśli podano slug → `~/knowledge/<slug>`; inaczej użyj bazy, w której jesteśmy (najbliższy przodek z `knowledge.config.json`).
2. Jeśli baza ma remote: `git pull --ff-only`. Przy konflikcie ff — zaraportuj i nie wymuszaj.
3. `node scripts/reindex.mjs` — przebuduj `INDEX.md` + `kb-data.js` (są w .gitignore, więc zawsze świeże lokalnie).
4. Zaraportuj zwięźle: co przyszło (skrót zmian z `git log`), liczbę artykułów i ostrzeżenia health-check, jeśli są.
