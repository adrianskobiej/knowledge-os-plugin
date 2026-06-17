# knowledge-os

🇬🇧 English version: [README.md](README.md)

Uniwersalny, przenośny system wiedzy firmowej. **Markdown jako źródło prawdy** (tani dla LLM) + **samodzielny `viewer.html`** do czytania w przeglądarce (offline, z dwukliku). Każda firma dostaje **własną, niezależną bazę** — ten pakiet to mechanika, którą się ją stempluje.

## Jak to działa

- Treść = pliki `.md` w `dzialy/`, `projekty/`, `ludzie/`, `koncepty/`, każdy z frontmatterem (patrz `_szablony/`).
- `scripts/reindex.mjs` generuje z frontmatterów:
  - **`INDEX.md`** — lekki indeks, który LLM czyta NAJPIERW (jedna linia/plik), żeby nie ładować całej bazy do kontekstu.
  - **`kb-data.js`** — pełne dane (HTML + backlinki) dla `viewer.html`.
- Oba pliki są generowane i w `.gitignore` → zero konfliktów merge. Regeneruje się je po każdym pobraniu/zmianie.

## Cykl pracy

```
ingest   → wrzuć surowiec do raw/, poproś agenta o skompilowanie do artykułów
reindex  → node scripts/reindex.mjs   (przebudowa INDEX.md + kb-data.js)
czytaj   → otwórz viewer.html (człowiek) / INDEX.md (LLM)
deploy   → commit + push do repo firmy
```

Health-check: `node scripts/reindex.mjs --lint` (braki summary, martwe linki, sieroty, duplikaty slugów, błędne `authority`, sygnały chronionych cytatów).

## Warstwa „data room" (zbierz i oznacz, potem decyduj)

Dla wiedzy spornej/zmiennej (typowo praca konsultanta z materiałami klienta):

- **Proweniencja** — w frontmatterze opcjonalne `source` i `authority` (`primary`/`secondary`/`derived`). `INDEX.md` i viewer pokazują wagę źródła; `/kb-query` waży `primary` przed słabszymi.
- **`BRIEF.md`** — dokument sterujący per folder (cel, odbiorca, hierarchia źródeł). Pinowany na górze INDEX i viewera; agent czyta go przed pracą w tym folderze. Wzór: `_szablony/brief.md`.
- **`CONFLICTS.md` / `MISSING.md`** — generowane na żądanie przez `/kb-lint` (pass LLM): sprzeczności między źródłami i luki względem briefu. **Surfacing, nie rozstrzyganie** — decyzja należy do człowieka.
- **Chronione cytaty (wymuszone kodem)** — `quotes.json` (`id`, `text`, opcjonalnie `in`). `reindex` hashuje je i ostrzega, gdy chroniony tekst zmienił się od zatwierdzenia albo nie występuje dosłownie w pliku. Po świadomej zmianie: `node scripts/reindex.mjs --bless-quotes` (zapisuje `.quotes.lock.json`).

## Wdrożenie u nowej firmy

Każda firma = osobne, prywatne repo git. Skopiuj zawartość `template/` jako start nowej bazy, ustaw `knowledge.config.json` (nazwa firmy, działy), podmień treść zalążkową na swoją.

## Struktura repo (repo = plugin Claude Code)

- `.claude-plugin/plugin.json` — manifest pluginu. **Faza 2 — gotowa.**
- `.claude-plugin/marketplace.json` — marketplace (jedno repo = marketplace + plugin).
- `commands/` — komendy `/kb-setup` (instalacja prowadzona przez agenta), `/kb-init`, `/kb-sync`, `/kb-ingest`, `/kb-query`, `/kb-deploy`, `/kb-lint`.
- `hooks/hooks.json` + `scripts/kb-autoindex.mjs` — auto-reindex po każdym zapisie w bazie.
- `template/` — szablon bazy wiedzy (stempel dla nowej firmy), z własnym `scripts/reindex.mjs` i `viewer.html`. **Faza 1 — gotowa.**

## Uniwersalność (Claude Code / Codex / Antigravity / dowolny agent)

Silnik jest niezależny od narzędzia: `scripts/reindex.mjs` to czysty Node (zero zależności), a `viewer.html` to samodzielny plik. Działają tak samo wszędzie (macOS / Linux / Windows). Specyficzny dla Claude jest tylko *klej* (slash-komendy, hook), który ma swoje odpowiedniki w innych narzędziach.

Dwa poziomy używania:

1. **Bez instalacji — w każdym agencie.** Każda baza zawiera `AGENTS.md` (czytany przez Claude, Codex, Antigravity, Cursor…). Wystarczy otworzyć katalog bazy — asystent wie, czym jest, i wykonuje workflow przez `node scripts/reindex.mjs`.
2. **Z adapterami komend `/kb-*`** w wybranym narzędziu — jeden installer:

```
node install.mjs                 # wykryj narzędzia, zainstaluj PL+EN
node install.mjs --lang=en       # tylko EN (pl | en | both)
node install.mjs --tools=codex   # tylko wybrane (claude,codex,antigravity)
node install.mjs --dry-run       # podgląd, nic nie zapisuje
```

Installer kładzie komendy tam, gdzie każde narzędzie ich szuka: Claude → `~/.claude/commands/knowledge-os/`, Codex → `~/.codex/prompts/`, Antigravity → skill w `~/.gemini/skills/knowledge-os/`.

Auto-reindex niezależny od narzędzia (zamiennik Claude-hooka): w katalogu bazy uruchom raz `node scripts/reindex.mjs --install-git-hook` — reindex odpali się po `commit` / `pull` / `checkout`.

## Instalacja (Claude Code — wariant pluginowy)

```
/plugin marketplace add ~/knowledge-os
/plugin install knowledge-os
```

Potem napisz **`/kb-setup`** — agent przeprowadzi przez resztę (także osobę nietechniczną): sprawdzi wymagania, połączy z bazą firmy lub założy nową, spersonalizuje i otworzy viewer. Wersja techniczna: `/kb-init <slug> [url-repo]`. Ściąga dla początkujących: `START-TUTAJ.md`.

## Znane ograniczenia renderera

Minimalny renderer Markdown (zero zależności). Nie składa **pogrubienia owiniętego wokół kodu inline** (`**\`x\`**`) — w treści trzymaj kod poza `**…**`.
