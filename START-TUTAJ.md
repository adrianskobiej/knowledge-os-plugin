# START TUTAJ — instalacja w 2 krokach

Nie musisz znać się na technologii. Asystent zrobi za Ciebie całą robotę. Twoje zadanie: wykonać krok 1, potem napisać jedno polecenie z kroku 2 i odpowiadać na proste pytania.

## Krok 1 — Zainstaluj wtyczkę (raz na komputer)

**W aplikacji Cowork:** na liście wtyczek znajdź **knowledge-os** i kliknij „Zainstaluj".

**W Claude Code (terminal):** napisz po kolei te dwie linijki:

```
/plugin marketplace add ~/knowledge-os
/plugin install knowledge-os
```

## Krok 2 — Powiedz asystentowi, żeby ustawił bazę

Napisz po prostu:

```
/kb-setup
```

I tyle. Od tego momentu **asystent przejmuje stery**:
- sprawdzi, czego potrzeba, i sam to doinstaluje,
- połączy Cię z bazą wiedzy firmy (albo założy nową, jeśli jesteś pierwszą osobą),
- spersonalizuje ją pod Ciebie,
- otworzy okno z wiedzą w przeglądarce.

Ty tylko odpowiadasz na proste pytania (np. „jak masz na imię?", „czy ktoś w firmie już tego używa?") i ewentualnie klikasz „zaloguj" w przeglądarce.

---

### Co potem?

- **Chcesz coś sprawdzić?** → `/kb-query Twoje pytanie`
- **Masz notatkę/dokument do zapisania?** → wklej i poproś o dodanie (`/kb-ingest`)
- **Chcesz najnowszą wiedzę od zespołu?** → `/kb-sync`

Pełny opis projektu: zobacz `README.pl.md`.
