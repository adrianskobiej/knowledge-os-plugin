---
title: Jak dodawać wiedzę do bazy
slug: jak-dodawac-wiedze
category: koncepty
summary: Zasady pisania artykułów, struktura frontmatter i cykl pracy (ingest → reindex → deploy).
tags: [meta, onboarding, konwencje]
status: stable
created: 2026-06-16
updated: 2026-06-16
---

# Jak dodawać wiedzę do bazy

Ta baza to zbiór plików `.md`. Człowiek czyta je przez `viewer.html`, a LLM przez lekki `INDEX.md`.

## Zasady

1. Każdy artykuł ma frontmatter z polami: `title`, `slug`, `category`, `summary`, `status`. Skopiuj szablon z `_szablony/`.
2. Pole summary jest najważniejsze — `summary` to jedyna rzecz, jaką LLM widzi w indeksie, zanim zdecyduje otworzyć plik. Jedno konkretne zdanie.
3. Linkuj liberalnie przez `[[slug]]`. Z tych linków budują się backlinki — np. zobacz [[proces-sprzedazy]] albo profil [[anna-nowak]].
4. Jeden plik = jeden temat. Lepiej kilka małych, powiązanych artykułów niż jeden wielki.

## Cykl pracy

- Ingest — wrzuć surowiec do `raw/`, poproś agenta o skompilowanie do artykułów.
- Reindex — `node scripts/reindex.mjs` przebudowuje `INDEX.md` + `kb-data.js`.
- Deploy — commit + push do repo firmy (każda firma ma własne, niezależne repo).

## Health-check

`node scripts/reindex.mjs --lint` wskaże braki summary, martwe linki `[[…]]` i sieroty.
