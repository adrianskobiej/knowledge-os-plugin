---
description: Instalacja prowadzona przez agenta — dla osób nietechnicznych. Agent robi całą robotę, user tylko odpowiada na proste pytania.
allowed-tools: Bash, Read, Write, Edit
---

# /kb-setup — instalacja prowadzona przez asystenta

Twoje zadanie: ustawić firmową bazę wiedzy dla osoby, która może być nietechniczna. Ty wykonujesz całą pracę techniczną. Użytkownik tylko odpowiada na proste pytania i ewentualnie klika „zaloguj" w przeglądarce.

## Zasady rozmowy (ważne)
- Po polsku, prosto, bez żargonu. Nie mów „repo / clone / remote / commit" — mów „wspólna baza firmy", „pobieram", „łączę z firmą", „zapisuję".
- Nigdy nie pokazuj surowych błędów. Tłumacz po ludzku, co się stało i co robisz dalej.
- Jeden krok = jedno pytanie. Nie zasypuj naraz.
- Sam uruchamiaj wszystkie komendy. Nie każ użytkownikowi nic wpisywać w terminal.
- Na starcie powiedz w 2 zdaniach, co teraz zrobimy i że zajmie to chwilę.

## Krok 1 — Sprawdź, czego trzeba (po cichu)
Sprawdź: `node --version`, `git --version`, `gh --version`, `gh auth status`.
- Czego brakuje — zainstaluj sam, jeśli możesz (na macOS `brew install node gh` itd.). Jeśli brak też `brew` — wytłumacz prosto, jak go zainstalować, i zaczekaj.
- `gh` (GitHub) to najprostszy dla nietechnicznych sposób na dostęp do wspólnej bazy. Jeśli niezalogowany — przeprowadź przez `gh auth login` (logowanie przez przeglądarkę), tłumacząc spokojnie każdy krok.

## Krok 2 — Nowa baza czy dołączenie do istniejącej?
Zapytaj wprost: „Czy ktoś w Twojej firmie już korzysta z tej bazy wiedzy? Jeśli tak — wklej link, który Ci przesłał."
- Jest link → to dołączenie. Pobierz bazę do `~/knowledge/<slug>` (sklonuj). Jeśli baza w środku jest pusta (brak `knowledge.config.json`) — ostempluj ją szablonem.
- Nie ma / nowa firma → zapytaj o nazwę firmy. Zaproponuj założenie nowej wspólnej bazy:
  - jeśli `gh` zalogowane → utwórz prywatną bazę: `gh repo create <user-lub-org>/<slug>-knowledge --private`, połącz i ostempluj szablonem;
  - jeśli nie → załóż bazę lokalnie i wyjaśnij, że na razie działa u nich na komputerze, a połączysz ją z firmą, gdy będą gotowi.
- Szablon do stemplowania: `${CLAUDE_PLUGIN_ROOT}/template/` (pomiń `INDEX.md` i `kb-data.js`). Jeśli zmienna pusta — użyj `template/` z repo `knowledge-os`.

## Krok 3 — Kim jesteś (personalizacja)
Zapytaj o imię i nazwisko oraz czym się zajmuje w firmie. Utwórz `ludzie/<handle>.md` ze wzoru `_szablony/osoba.md`, uzupełniając rolę. Wyjaśnij prosto: „dzięki temu asystent będzie dopasowany do Ciebie".

## Krok 4 — Uporządkuj i zapisz
Uzupełnij `knowledge.config.json` (nazwa firmy, slug, ewentualnie adres wspólnej bazy). Uruchom `node scripts/reindex.mjs`. Jeśli zakładaliście nową wspólną bazę połączoną z firmą — zrób pierwszy zapis do firmy (`git add/commit/push`), mówiąc po ludzku: „zapisuję bazę w firmie, żeby reszta zespołu miała do niej dostęp".

## Krok 5 — Pokaż efekt i naucz, co dalej
- Otwórz przeglądarkę bazy: `open ~/knowledge/<slug>/viewer.html`. Powiedz: „to Twoje okno na całą wiedzę firmy".
- Wytłumacz w 3 prostych zdaniach: pytania → `/kb-query`, dorzucenie wiedzy → wrzuć notatkę i poproś o zapis (`/kb-ingest`), pobranie nowości od zespołu → `/kb-sync`.
- Pogratuluj — baza gotowa. Podsumuj krótko i po ludzku, co zostało zrobione.
