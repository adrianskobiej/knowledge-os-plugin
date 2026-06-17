#!/usr/bin/env node
// reindex.mjs — przebudowuje INDEX.md (lekki, dla LLM) + kb-data.js (dla viewer.html)
// na podstawie frontmatterów w artykułach .md. Zero zależności — wymaga tylko `node`.
//
// Użycie:  node scripts/reindex.mjs           (uruchom z katalogu głównego bazy wiedzy)
//          node scripts/reindex.mjs --lint     (tylko raport spójności, bez zapisu)
//          node scripts/reindex.mjs --bless-quotes  (zatwierdź obecny stan chronionych cytatów)

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { join, relative, sep, dirname, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const CONTENT_DIRS = ['dzialy', 'projekty', 'ludzie', 'koncepty'];
const LINT_ONLY = process.argv.includes('--lint');
const BLESS = process.argv.includes('--bless-quotes');
const INSTALL_HOOK = process.argv.includes('--install-git-hook');
const REQUIRED = ['title', 'slug', 'category', 'summary', 'status'];
const AUTHORITIES = ['primary', 'secondary', 'derived'];
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// ── Uniwersalny auto-reindex (niezależny od narzędzia: Claude / Codex / Antigravity) ──
// Claude ma własny hook PostToolUse; inne narzędzia nie. Git-hooki działają wszędzie:
// reindex po commit / pull / checkout. Nie nadpisujemy cudzych hooków.
if (INSTALL_HOOK) {
  const gitDir = join(ROOT, '.git');
  if (!existsSync(gitDir)) { console.error('✗ To nie jest repo git (brak .git) — uruchom w katalogu bazy.'); process.exit(1); }
  const hooksDir = join(gitDir, 'hooks');
  mkdirSync(hooksDir, { recursive: true });
  const body = `#!/bin/sh\n# knowledge-os auto-reindex\nnode "scripts/reindex.mjs" >/dev/null 2>&1 || true\n`;
  for (const h of ['pre-commit', 'post-merge', 'post-checkout']) {
    const p = join(hooksDir, h);
    if (existsSync(p) && !readFileSync(p, 'utf8').includes('knowledge-os auto-reindex')) {
      console.log(`· Pominięto ${h}: istnieje już inny hook. Dodaj ręcznie: node scripts/reindex.mjs`); continue;
    }
    writeFileSync(p, body); chmodSync(p, 0o755);
    console.log(`✓ ${h}`);
  }
  console.log('✓ Git-hooki zainstalowane → auto-reindex po commit / pull / checkout');
  process.exit(0);
}

// ── Zbieranie plików ──────────────────────────────────────────────────────
function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name.startsWith('_')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (extname(e.name) === '.md' && e.name !== 'INDEX.md') acc.push(full);
  }
  return acc;
}

// ── Frontmatter ─────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const fmBlock = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, '');
  const meta = {};
  for (const line of fmBlock.split('\n')) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      meta[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      meta[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body };
}

// Usuwa kod (fence + inline), żeby ekstrakcja linków nie łapała przykładów składni.
const stripCode = s => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');

// ── Renderer Markdown → HTML (minimalny, samowystarczalny) ──────────────────
// Escapujemy też cudzysłowy — wartości trafiają do atrybutów (href), więc bez tego
// możliwe byłoby wyjście z atrybutu i wstrzyknięcie własnego handlera (XSS).
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Dopuszcza tylko bezpieczne schematy URL (http/https/mailto), kotwice i ścieżki
// względne. Odrzuca m.in. javascript:/data:/vbscript: → '#'. Wejście jest już po esc().
const safeUrl = u => {
  const t = u.trim();
  const scheme = (t.match(/^([a-z][a-z0-9+.\-]*):/i) || [])[1];
  if (scheme && !/^(https?|mailto)$/i.test(scheme)) return '#';
  return t;
};

// Formatuje tekst inline. Kod inline jest izolowany w segmentach (split),
// więc formatowanie nigdy nie wchodzi do środka backtick-ów.
function inline(text, slugs) {
  return text.split(/(`[^`]+`)/g).map(seg => {
    if (seg.length > 1 && seg.startsWith('`') && seg.endsWith('`'))
      return `<code>${esc(seg.slice(1, -1))}</code>`;
    let t = esc(seg);
    t = t.replace(WIKILINK, (_, slug, label) => {
      slug = slug.trim();
      const ok = slugs.has(slug);
      return `<a class="wikilink${ok ? '' : ' broken'}" href="#${slug}">${(label || slug).trim()}</a>`;
    });
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, x, u) => `<a href="${safeUrl(u)}">${x}</a>`);
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return t;
  }).join('');
}

function mdToHtml(md, slugs) {
  const lines = md.split('\n');
  let html = '', i = 0, inCode = false, codeBuf = [], list = null;
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  const SPECIAL = /^(#{1,6}\s|```|>|[-*]\s|\d+\.\s|---+\s*$)/;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      if (!inCode) { closeList(); inCode = true; codeBuf = []; }
      else { inCode = false; html += `<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`; }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }
    let m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) { closeList(); const l = m[1].length; html += `<h${l}>${inline(m[2], slugs)}</h${l}>`; i++; continue; }
    if (/^---+\s*$/.test(line)) { closeList(); html += '<hr>'; i++; continue; }
    if (/^>\s?/.test(line)) { closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ''), slugs)}</blockquote>`; i++; continue; }
    m = line.match(/^[-*]\s+(.*)$/);
    if (m) { if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; } html += `<li>${inline(m[1], slugs)}</li>`; i++; continue; }
    m = line.match(/^\d+\.\s+(.*)$/);
    if (m) { if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; } html += `<li>${inline(m[1], slugs)}</li>`; i++; continue; }
    if (/^\s*$/.test(line)) { closeList(); i++; continue; }
    closeList();
    const para = [line]; i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !SPECIAL.test(lines[i])) { para.push(lines[i]); i++; }
    html += `<p>${inline(para.join(' '), slugs)}</p>`;
  }
  closeList();
  return html;
}

// ── Główny przebieg ──────────────────────────────────────────────────────────
const allFiles = CONTENT_DIRS.flatMap(d => walk(join(ROOT, d)));
const briefFiles = allFiles.filter(f => basename(f) === 'BRIEF.md');
const files = allFiles.filter(f => basename(f) !== 'BRIEF.md');
const articles = [];
const briefs = [];
const warnings = [];

// BRIEF.md — dokumenty sterujące per folder (cel, odbiorca, hierarchia źródeł).
// Nie są artykułami; agent czyta je przed pracą w danym folderze.
for (const file of briefFiles) {
  const raw = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).split(sep).join('/');
  const heading = (raw.match(/^#\s+(.*)$/m) || [])[1] || `Brief: ${dirname(rel)}`;
  briefs.push({ folder: dirname(rel), path: rel, title: heading.trim(), _body: raw });
}

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);
  const parsed = parseFrontmatter(raw);
  if (!parsed) { warnings.push(`✗ Brak frontmatter: ${rel}`); continue; }
  const { meta, body } = parsed;
  const slug = meta.slug || basename(file, '.md');
  for (const f of REQUIRED) if (!meta[f]) warnings.push(`⚠ Brak pola "${f}": ${rel}`);
  if (meta.authority && !AUTHORITIES.includes(meta.authority))
    warnings.push(`⚠ Nieznane authority "${meta.authority}" (dozwolone: ${AUTHORITIES.join('/')}): ${rel}`);
  const wikilinks = [...stripCode(body).matchAll(WIKILINK)].map(m => m[1].trim());
  articles.push({
    slug,
    title: meta.title || slug,
    path: rel.split(sep).join('/'),
    category: meta.category || rel.split(sep)[0],
    summary: meta.summary || '',
    tags: meta.tags || [],
    status: meta.status || 'draft',
    updated: meta.updated || '',
    source: meta.source || '',
    authority: meta.authority || '',
    links: [...new Set(wikilinks)],
    _body: body,
  });
}

// Duplikaty slugów (psują linkowanie — dwa pliki o tym samym slugu)
const seen = {};
for (const a of articles) {
  if (seen[a.slug]) warnings.push(`⚠ Zduplikowany slug "${a.slug}": ${a.path} oraz ${seen[a.slug]}`);
  else seen[a.slug] = a.path;
}

// Zbyt krótkie / nieinformatywne summary
for (const a of articles)
  if (a.summary && a.summary.trim().length < 15)
    warnings.push(`· Bardzo krótkie summary (dopracuj): ${a.path}`);

// Mapa slugów + backlinki
const slugs = new Set(articles.map(a => a.slug));
const backlinks = Object.fromEntries(articles.map(a => [a.slug, []]));
for (const a of articles)
  for (const t of a.links) {
    if (!slugs.has(t)) warnings.push(`⚠ Martwy link [[${t}]] w: ${a.path}`);
    else backlinks[t].push(a.slug);
  }

// Sieroty (nikt nie linkuje i sam nie linkuje)
for (const a of articles)
  if (backlinks[a.slug].length === 0 && a.links.length === 0)
    warnings.push(`· Sierota (brak linków): ${a.path}`);

// ── Ochrona cytatów (wymuszona kodem, nie tylko promptem) ───────────────────
// quotes.json: [{ id, text, in? }]. Lock (.quotes.lock.json) = zatwierdzony stan.
// Bez --bless-quotes: ostrzega, gdy chroniony tekst zmienił się od zatwierdzenia
// albo gdy nie występuje dosłownie w pliku wskazanym przez "in".
const norm = s => s.replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(norm(s)).digest('hex').slice(0, 12);
const quotesPath = join(ROOT, 'quotes.json');
const lockPath = join(ROOT, '.quotes.lock.json');
if (existsSync(quotesPath)) {
  let quotes = [];
  try { quotes = (JSON.parse(readFileSync(quotesPath, 'utf8')).quotes) || []; }
  catch { warnings.push('⚠ quotes.json: niepoprawny JSON'); }
  let lock = {};
  if (existsSync(lockPath)) { try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); } catch {} }
  const fresh = {};
  for (const q of quotes) {
    if (!q.id || !q.text) { warnings.push('⚠ quotes.json: wpis bez id/text'); continue; }
    const h = hash(q.text);
    fresh[q.id] = h;
    if (lock[q.id] && lock[q.id] !== h)
      warnings.push(`🔒 Chroniony cytat ZMIENIONY od ostatniego --bless-quotes: "${q.id}"`);
    else if (!lock[q.id])
      warnings.push(`🔒 Nowy chroniony cytat (zatwierdź: --bless-quotes): "${q.id}"`);
    if (q.in) {
      const f = join(ROOT, q.in);
      if (!existsSync(f)) warnings.push(`🔒 Cytat "${q.id}": brak pliku ${q.in}`);
      else if (!norm(readFileSync(f, 'utf8')).includes(norm(q.text)))
        warnings.push(`🔒 Cytat "${q.id}" nie występuje DOSŁOWNIE w ${q.in} (parafraza?)`);
    }
  }
  if (BLESS && !LINT_ONLY) {
    writeFileSync(lockPath, JSON.stringify(fresh, null, 2));
    console.log(`🔒 Zatwierdzono ${Object.keys(fresh).length} chronionych cytatów → .quotes.lock.json`);
  }
}

// ── Raport / lint ─────────────────────────────────────────────────────────
const drafts = articles.filter(a => a.status === 'draft').length;
console.log(`\n📚 Artykuły: ${articles.length}${drafts ? ` (drafty: ${drafts})` : ''}`);
if (warnings.length) { console.log(`\n— Health-check (${warnings.length}):`); warnings.forEach(w => console.log('  ' + w)); }
else console.log('✓ Health-check czysty');
if (LINT_ONLY) { console.log('\n(--lint: nic nie zapisano)\n'); process.exit(0); }

// ── INDEX.md (lekki, dla LLM) ─────────────────────────────────────────────
const byTop = {};
for (const a of articles) (byTop[a.path.split('/')[0]] ??= []).push(a);
let idx = `# INDEX — baza wiedzy\n\n`;
idx += `> Generowane automatycznie przez \`scripts/reindex.mjs\`. Nie edytuj ręcznie.\n`;
idx += `> LLM: czytaj ten plik NAJPIERW, potem otwieraj tylko potrzebne artykuły i idź po linkach.\n\n`;
idx += `Artykułów: **${articles.length}** · ostatnia przebudowa: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}\n`;
if (briefs.length) {
  idx += `\n## 📋 Briefy (przeczytaj przed pracą w danym folderze)\n\n`;
  for (const b of briefs.sort((x, y) => x.folder.localeCompare(y.folder)))
    idx += `- **[${b.folder}](${b.path})** — ${b.title}\n`;
}
for (const top of Object.keys(byTop).sort()) {
  idx += `\n## ${top}\n\n`;
  for (const a of byTop[top].sort((x, y) => x.path.localeCompare(y.path))) {
    const tags = a.tags.length ? ` · \`${a.tags.join(', ')}\`` : '';
    const upd = a.updated ? ` · upd. ${a.updated}` : '';
    const st = a.status !== 'stable' ? ` _(${a.status})_` : '';
    const auth = a.authority && a.authority !== 'primary' ? ` · ⟨${a.authority}⟩` : '';
    idx += `- **[${a.title}](${a.path})**${st} — ${a.summary}${tags}${auth}${upd}\n`;
  }
}
writeFileSync(join(ROOT, 'INDEX.md'), idx);

// ── kb-data.js (bogaty, dla viewer.html) ───────────────────────────────────
let config = {};
try { config = JSON.parse(readFileSync(join(ROOT, 'knowledge.config.json'), 'utf8')); } catch {}
const data = {
  company: config.company || { name: 'Baza wiedzy' },
  generatedAt: new Date().toISOString(),
  articles: articles.map(a => ({
    slug: a.slug, title: a.title, path: a.path, category: a.category,
    summary: a.summary, tags: a.tags, status: a.status, updated: a.updated,
    source: a.source, authority: a.authority,
    links: a.links, backlinks: backlinks[a.slug],
    html: mdToHtml(a._body, slugs),
  })),
  briefs: briefs.map(b => ({
    folder: b.folder, path: b.path, title: b.title,
    html: mdToHtml(b._body, slugs),
  })),
};
const js = `window.KB_DATA = ${JSON.stringify(data, null, 2).replace(/<\/script>/gi, '<\\/script>')};`;
writeFileSync(join(ROOT, 'kb-data.js'), js);

console.log(`\n✓ Zapisano INDEX.md (${(idx.length / 1024).toFixed(1)} KB) + kb-data.js (${(js.length / 1024).toFixed(1)} KB)\n`);
