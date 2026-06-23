#!/usr/bin/env node
// reindex.mjs — rebuilds INDEX.md (lightweight, for LLMs) + kb-data.js (for viewer.html)
// from the frontmatter in .md articles. Zero dependencies — needs only `node`.
//
// Usage:  node scripts/reindex.mjs           (run from the knowledge base root)
//         node scripts/reindex.mjs --lint     (consistency report only, no writes)
//         node scripts/reindex.mjs --bless-quotes  (approve the current protected-quotes state)

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { join, relative, sep, dirname, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const CONTENT_DIRS = ['departments', 'projects', 'people', 'concepts', 'skills', 'meetings'];
const LINT_ONLY = process.argv.includes('--lint');
const BLESS = process.argv.includes('--bless-quotes');
const INSTALL_HOOK = process.argv.includes('--install-git-hook');
const STATS = process.argv.includes('--stats');
const REQUIRED = ['title', 'slug', 'category', 'summary', 'status'];
const AUTHORITIES = ['primary', 'secondary', 'derived'];
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// ── Universal auto-reindex (tool-agnostic: Claude / Codex / Antigravity) ──────
// Claude has its own PostToolUse hook; other tools don't. Git hooks work everywhere:
// reindex on commit / pull / checkout. We never overwrite someone else's hooks.
if (INSTALL_HOOK) {
  const gitDir = join(ROOT, '.git');
  if (!existsSync(gitDir)) { console.error('✗ Not a git repo (no .git) — run inside a base directory.'); process.exit(1); }
  const hooksDir = join(gitDir, 'hooks');
  mkdirSync(hooksDir, { recursive: true });
  const body = `#!/bin/sh\n# knowledge-os auto-reindex\nnode "scripts/reindex.mjs" >/dev/null 2>&1 || true\n`;
  for (const h of ['pre-commit', 'post-merge', 'post-checkout']) {
    const p = join(hooksDir, h);
    if (existsSync(p) && !readFileSync(p, 'utf8').includes('knowledge-os auto-reindex')) {
      console.log(`· Skipped ${h}: another hook already exists. Add manually: node scripts/reindex.mjs`); continue;
    }
    writeFileSync(p, body); chmodSync(p, 0o755);
    console.log(`✓ ${h}`);
  }
  console.log('✓ Git hooks installed → auto-reindex on commit / pull / checkout');
  process.exit(0);
}

// ── Collecting files ────────────────────────────────────────────────────────
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

// Strips code (fenced + inline) so link extraction doesn't catch syntax examples.
const stripCode = s => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');

// ── Markdown → HTML renderer (minimal, self-contained) ──────────────────────
// We also escape quotes — values land inside attributes (href), so without this
// it would be possible to break out of the attribute and inject a handler (XSS).
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Allows only safe URL schemes (http/https/mailto), anchors and relative paths.
// Rejects e.g. javascript:/data:/vbscript: → '#'. Input is already esc()'d.
const safeUrl = u => {
  const t = u.trim();
  const scheme = (t.match(/^([a-z][a-z0-9+.\-]*):/i) || [])[1];
  if (scheme && !/^(https?|mailto)$/i.test(scheme)) return '#';
  return t;
};

// Formats inline text. Inline code is isolated into segments (split),
// so formatting never leaks inside backticks.
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

// ── Main pass ───────────────────────────────────────────────────────────────
const allFiles = CONTENT_DIRS.flatMap(d => walk(join(ROOT, d)));
const briefFiles = allFiles.filter(f => basename(f) === 'BRIEF.md');
const files = allFiles.filter(f => basename(f) !== 'BRIEF.md');
const articles = [];
const briefs = [];
const warnings = [];

// BRIEF.md — steering documents per folder (goal, audience, source hierarchy).
// They are not articles; the agent reads them before working in that folder.
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
  if (!parsed) { warnings.push(`✗ Missing frontmatter: ${rel}`); continue; }
  const { meta, body } = parsed;
  const slug = meta.slug || basename(file, '.md');
  for (const f of REQUIRED) if (!meta[f]) warnings.push(`⚠ Missing field "${f}": ${rel}`);
  if (meta.authority && !AUTHORITIES.includes(meta.authority))
    warnings.push(`⚠ Unknown authority "${meta.authority}" (allowed: ${AUTHORITIES.join('/')}): ${rel}`);
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
    author: meta.author || '',
    links: [...new Set(wikilinks)],
    _body: body,
  });
}

// Duplicate slugs (break linking — two files with the same slug)
const seen = {};
for (const a of articles) {
  if (seen[a.slug]) warnings.push(`⚠ Duplicate slug "${a.slug}": ${a.path} and ${seen[a.slug]}`);
  else seen[a.slug] = a.path;
}

// Too short / uninformative summary
for (const a of articles)
  if (a.summary && a.summary.trim().length < 15)
    warnings.push(`· Very short summary (refine it): ${a.path}`);

// Slug map + backlinks
const slugs = new Set(articles.map(a => a.slug));
const backlinks = Object.fromEntries(articles.map(a => [a.slug, []]));
for (const a of articles)
  for (const t of a.links) {
    if (!slugs.has(t)) warnings.push(`⚠ Dead link [[${t}]] in: ${a.path}`);
    else backlinks[t].push(a.slug);
  }

// Orphans (nobody links to it and it links to nobody)
for (const a of articles)
  if (backlinks[a.slug].length === 0 && a.links.length === 0)
    warnings.push(`· Orphan (no links): ${a.path}`);

// Stale content (knowledge rot): `updated` older than 6 months
const STALE_DAYS = 180;
const _now = Date.now();
for (const a of articles) {
  const t = Date.parse(a.updated);
  if (!Number.isNaN(t) && (_now - t) / 86400000 > STALE_DAYS)
    warnings.push(`· Stale (updated ${a.updated}, > 6 months — review): ${a.path}`);
}

// Config sanity — surface problems instead of silently swallowing them
let config = {};
try { config = JSON.parse(readFileSync(join(ROOT, 'knowledge.config.json'), 'utf8')); }
catch { warnings.push('⚠ knowledge.config.json: missing or invalid JSON'); }
if (config.departments && !Array.isArray(config.departments))
  warnings.push('⚠ knowledge.config.json: "departments" must be an array');
if (config.roster && (typeof config.roster !== 'object' || Array.isArray(config.roster)))
  warnings.push('⚠ knowledge.config.json: "roster" must be an object (email → slug)');

// ── Quote protection (enforced by code, not just by prompt) ──────────────────
// quotes.json: [{ id, text, in? }]. Lock (.quotes.lock.json) = approved state.
// Without --bless-quotes: warns when protected text changed since approval
// or when it does not appear verbatim in the file referenced by "in".
const norm = s => s.replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(norm(s)).digest('hex').slice(0, 12);
const quotesPath = join(ROOT, 'quotes.json');
const lockPath = join(ROOT, '.quotes.lock.json');
if (existsSync(quotesPath)) {
  let quotes = [];
  try { quotes = (JSON.parse(readFileSync(quotesPath, 'utf8')).quotes) || []; }
  catch { warnings.push('⚠ quotes.json: invalid JSON'); }
  let lock = {};
  if (existsSync(lockPath)) { try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); } catch {} }
  const fresh = {};
  for (const q of quotes) {
    if (!q.id || !q.text) { warnings.push('⚠ quotes.json: entry without id/text'); continue; }
    const h = hash(q.text);
    fresh[q.id] = h;
    if (lock[q.id] && lock[q.id] !== h)
      warnings.push(`🔒 Protected quote CHANGED since last --bless-quotes: "${q.id}"`);
    else if (!lock[q.id])
      warnings.push(`🔒 New protected quote (approve with: --bless-quotes): "${q.id}"`);
    if (q.in) {
      const f = join(ROOT, q.in);
      if (!existsSync(f)) warnings.push(`🔒 Quote "${q.id}": missing file ${q.in}`);
      else if (!norm(readFileSync(f, 'utf8')).includes(norm(q.text)))
        warnings.push(`🔒 Quote "${q.id}" does not appear VERBATIM in ${q.in} (paraphrase?)`);
    }
  }
  if (BLESS && !LINT_ONLY) {
    writeFileSync(lockPath, JSON.stringify(fresh, null, 2));
    console.log(`🔒 Approved ${Object.keys(fresh).length} protected quotes → .quotes.lock.json`);
  }
}

// ── Report / lint ───────────────────────────────────────────────────────────
const drafts = articles.filter(a => a.status === 'draft').length;
console.log(`\n📚 Articles: ${articles.length}${drafts ? ` (drafts: ${drafts})` : ''}`);
if (warnings.length) { console.log(`\n— Health-check (${warnings.length}):`); warnings.forEach(w => console.log('  ' + w)); }
else console.log('✓ Health-check clean');
if (LINT_ONLY) { console.log('\n(--lint: nothing written)\n'); process.exit(0); }

// ── Stats (base health at a glance) ─────────────────────────────────────────
if (STATS) {
  const bySec = {};
  for (const a of articles) (bySec[a.path.split('/')[0]] ??= []).push(a);
  const byAuthor = {};
  for (const a of articles) { const k = a.author || '(unattributed)'; byAuthor[k] = (byAuthor[k] || 0) + 1; }
  const orphans = articles.filter(a => backlinks[a.slug].length === 0 && a.links.length === 0).length;
  const stale = warnings.filter(w => w.startsWith('· Stale')).length;
  console.log('\n— Stats —');
  console.log('By section:'); for (const s of Object.keys(bySec).sort()) console.log(`  ${s}: ${bySec[s].length}`);
  console.log('By author:'); for (const a of Object.keys(byAuthor).sort()) console.log(`  ${a}: ${byAuthor[a]}`);
  console.log(`Totals: ${articles.length} articles · ${drafts} drafts · ${orphans} orphans · ${stale} stale (>6mo)`);
  console.log('\n(--stats: nothing written)\n');
  process.exit(0);
}

// ── INDEX.md (lightweight, for LLMs) ────────────────────────────────────────
const byTop = {};
for (const a of articles) (byTop[a.path.split('/')[0]] ??= []).push(a);
let idx = `# INDEX — knowledge base\n\n`;
idx += `> Generated automatically by \`scripts/reindex.mjs\`. Do not edit by hand.\n`;
idx += `> LLM: read this file FIRST, then open only the articles you need and follow the links.\n\n`;
idx += `Articles: **${articles.length}** · last rebuild: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}\n`;
if (briefs.length) {
  idx += `\n## 📋 Briefs (read before working in a given folder)\n\n`;
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
    const by = a.author ? ` · by ${a.author}` : '';
    idx += `- **[${a.title}](${a.path})**${st} — ${a.summary}${tags}${auth}${by}${upd}\n`;
  }
}
writeFileSync(join(ROOT, 'INDEX.md'), idx);

// ── kb-data.js (rich, for viewer.html) ──────────────────────────────────────
// `config` is already loaded + validated above.
const data = {
  company: config.company || { name: 'Knowledge base' },
  generatedAt: new Date().toISOString(),
  articles: articles.map(a => ({
    slug: a.slug, title: a.title, path: a.path, category: a.category,
    summary: a.summary, tags: a.tags, status: a.status, updated: a.updated,
    source: a.source, authority: a.authority, author: a.author,
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

console.log(`\n✓ Wrote INDEX.md (${(idx.length / 1024).toFixed(1)} KB) + kb-data.js (${(js.length / 1024).toFixed(1)} KB)\n`);
