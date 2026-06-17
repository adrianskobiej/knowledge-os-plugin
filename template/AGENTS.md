# AGENTS.md — baza wiedzy (knowledge-os)

> Ten plik czyta każdy asystent AI (Claude Code, Codex, Antigravity, Cursor…), gdy
> otworzy ten katalog. Opisuje, czym jest ta baza i jak z nią pracować — bez żadnej
> instalacji specyficznej dla narzędzia. Komendy `/kb-*` to tylko wygodne skróty na
> procedury opisane niżej; jeśli Twoje narzędzie ich nie ma, wykonaj kroki ręcznie.

## Co to jest

Firmowa baza wiedzy. Źródłem prawdy są pliki `.md` z frontmatterem w katalogach:
`dzialy/`, `projekty/`, `ludzie/`, `koncepty/`. Z nich generowane są:
- `INDEX.md` — lekki indeks (jedna linia/artykuł). **Czytaj go NAJPIERW.**
- `kb-data.js` — dane dla `viewer.html` (czytelnik dla człowieka, offline).

Oba pliki są generowane i w `.gitignore` — nigdy ich nie edytuj ręcznie.

## Złota zasada dla asystenta

Nie ładuj całej bazy do kontekstu. Przeczytaj `INDEX.md`, na podstawie `summary`/`tags`
wytypuj 1–5 trafnych artykułów i otwórz tylko je; pogłębiaj idąc po linkach `[[slug]]`.

## Workflow (procedury = komendy /kb-*)

- **Zapytanie** (`/kb-query <pytanie>`): przeczytaj `INDEX.md` → otwórz trafne artykuły →
  odpowiedz zwięźle, cytując ścieżki plików. Waż `authority` (`primary` > `secondary` >
  `derived`). Sprzeczności sygnalizuj, nie rozstrzygaj.
- **Dodanie wiedzy** (`/kb-ingest [ścieżka|temat]`): przeczytaj surowiec z `raw/`, sprawdź
  `INDEX.md` i `BRIEF.md` docelowego folderu, napisz artykuł(y) `.md` z pełnym frontmatterem
  (wzory w `_szablony/`), linkuj przez `[[slug]]`, na końcu uruchom reindex.
- **Health-check** (`/kb-lint`): `node scripts/reindex.mjs --lint` — braki, martwe linki,
  sieroty, duplikaty, sygnały chronionych cytatów.
- **Synchronizacja** (`/kb-sync`): `git pull --ff-only` → reindex.
- **Wdrożenie** (`/kb-deploy`): reindex --lint → `git add -A` → commit → push.

## Komendy silnika (działają w każdym narzędziu)

```
node scripts/reindex.mjs                 # przebuduj INDEX.md + kb-data.js
node scripts/reindex.mjs --lint          # tylko health-check, bez zapisu
node scripts/reindex.mjs --bless-quotes  # zatwierdź chronione cytaty (quotes.json)
node scripts/reindex.mjs --install-git-hook  # uniwersalny auto-reindex (commit/pull/checkout)
```

Po każdej zmianie artykułów `.md` uruchom `node scripts/reindex.mjs`, żeby `INDEX.md`
i viewer były świeże. (Claude robi to automatycznie hookiem; inne narzędzia — przez
git-hooki z `--install-git-hook` albo ręcznie.)

## Reguły pisania artykułów

1. Frontmatter obowiązkowy: `title`, `slug`, `category`, `summary`, `status`. Wzór z `_szablony/`.
2. `summary` = jedno konkretne zdanie (to jedyne, co asystent widzi w indeksie).
3. Jeden plik = jeden temat. Linkuj liberalnie przez `[[slug]]`.
4. Proweniencja (opcjonalnie): `source` + `authority` zgodnie z `BRIEF.md` folderu.
5. Otwórz `viewer.html` w przeglądarce, by przeglądać bazę jak człowiek.
