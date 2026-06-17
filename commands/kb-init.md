---
description: Załóż nową bazę wiedzy firmy (stempel z szablonu) lub podłącz istniejące repo.
argument-hint: [slug-firmy] [url-repo (opcjonalnie)]
allowed-tools: Bash, Read, Write, Edit
---

# /kb-init — załóż lub podłącz bazę wiedzy

Argumenty: `$ARGUMENTS` (np. `acme` albo `acme git@github.com:acme/knowledge.git`)

Cel: przygotować niezależną bazę wiedzy firmy w `~/knowledge/<slug>`. Każda firma = osobne repo.

Kroki:
1. Ustal `slug` firmy (1. argument; jeśli brak — zapytaj). Katalog docelowy: `~/knowledge/<slug>`.
2. Szablon jest dołączony do pluginu w `${CLAUDE_PLUGIN_ROOT}/template/`. Jeśli zmienna jest pusta (uruchomienie z klona, nie z instalacji), użyj `template/` w repo `knowledge-os`.
3. Jeśli podano URL repo (2. argument):
   - `git clone <url> ~/knowledge/<slug>`.
   - Jeśli repo jest puste lub bez `knowledge.config.json` → ostempluj szablonem (krok 4).
   - Jeśli ma już bazę → pomiń stemplowanie, przejdź do kroku 6 (podłączenie do istniejącej).
   Bez URL: utwórz katalog i ostempluj szablonem.
4. Stempel: skopiuj zawartość szablonu do katalogu bazy. Nie kopiuj wygenerowanych `INDEX.md` ani `kb-data.js`.
5. Uzupełnij `knowledge.config.json`: `company.name`, `company.slug=<slug>`, `remote=<url>` jeśli był; dostosuj listę `departments`.
6. Zapytaj o Twój handle i rolę → utwórz `ludzie/<handle>.md` ze wzoru `_szablony/osoba.md`. Ustaw `external: true`, jeśli wdrażasz jako konsultant zewnętrzny.
7. Uruchom `node scripts/reindex.mjs` w katalogu bazy.
8. Pokaż: ścieżkę bazy, liczbę artykułów, polecenie otwarcia `viewer.html` (np. `open ~/knowledge/<slug>/viewer.html`).

Nie commituj automatycznie — od tego jest `/kb-deploy`.
