---
description: Zapisz swoją wiedzę do repo firmy (reindex + git commit + push).
argument-hint: [opis zmian (opcjonalnie)]
allowed-tools: Bash, Read
---

# /kb-deploy — wdrożenie zmian do firmy

1. Ustal katalog bazy (najbliższy przodek z `knowledge.config.json`).
2. `node scripts/reindex.mjs --lint`. Jeśli są poważne ostrzeżenia (martwe linki, braki `summary`) — pokaż je i zapytaj, czy mimo to kontynuować.
3. `git add -A` (wygenerowane `INDEX.md` i `kb-data.js` są w .gitignore — nie trafią do commita).
4. `git commit` z opisem z argumentu lub zwięzłym, wygenerowanym z diffa. Zakończ wiadomość commita stopką:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
5. `git push`. Jeśli brak remote — poinformuj, że baza jest lokalna, i pokaż jak dodać remote (`git remote add origin <url>`).
6. Zaraportuj, co zostało wypchnięte.
