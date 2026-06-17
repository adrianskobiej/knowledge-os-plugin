#!/usr/bin/env node
// install.mjs — installs knowledge-os command adapters into every AI coding tool found.
// One source (commands/*.md), adapted to each tool's convention. Pure Node, zero deps,
// cross-platform (macOS / Linux / Windows).
//
// Usage:
//   node install.mjs                     auto-detect tools, install PL + EN
//   node install.mjs --tools=codex,claude   only these tools (comma list)
//   node install.mjs --lang=en           only one language (pl | en | both; default both)
//   node install.mjs --dry-run           print what would happen, write nothing
//
// Engine + viewer + AGENTS.md are already tool-agnostic — this only installs the
// convenience "slash command" layer where each tool expects it.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const HERE = new URL('.', import.meta.url).pathname;
const HOME = homedir();
const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `--${k}=${d}`).split('=').slice(1).join('=');
const DRY = process.argv.includes('--dry-run');
const LANG = arg('lang', 'both');                       // pl | en | both
const FORCED = arg('tools', '').split(',').map(s => s.trim()).filter(Boolean);

// ── Tool registry ────────────────────────────────────────────────────────────
// detect: is the tool present on this machine? dir: where its commands/skills live.
const TOOLS = {
  claude: {
    label: 'Claude Code',
    detect: () => existsSync(join(HOME, '.claude')),
    dest: join(HOME, '.claude', 'commands', 'knowledge-os'),
    invoke: '/knowledge-os:kb-query (and kb-init, kb-ingest, …)',
  },
  codex: {
    label: 'Codex CLI',
    detect: () => existsSync(join(HOME, '.codex')),
    dest: join(HOME, '.codex', 'prompts'),
    invoke: '/prompts:kb-query (and kb-init, kb-ingest, …)',
  },
  antigravity: {
    label: 'Antigravity',
    detect: () => existsSync(join(HOME, '.gemini')) || existsSync(join(HOME, '.antigravity')),
    dest: join(HOME, '.gemini', 'skills', 'knowledge-os'),
    invoke: 'loaded as a skill — ask in natural language or use /kb-* workflows',
  },
};

// ── Read command sources (one source of truth) ───────────────────────────────
function parse(raw) {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw };
  const meta = {};
  for (const line of raw.slice(3, end).trim().split('\n')) {
    const m = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: raw.slice(end + 4).replace(/^\s*\n/, '') };
}

function loadCommands(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.startsWith('kb-') && f.endsWith('.md'))
    .map(f => ({ name: f.replace(/\.md$/, ''), ...parse(readFileSync(join(dir, f), 'utf8')) }));
}

const SETS = [];
if (LANG === 'pl' || LANG === 'both') SETS.push({ lang: 'pl', suffix: '', cmds: loadCommands(join(HERE, 'commands')) });
if (LANG === 'en' || LANG === 'both') SETS.push({ lang: 'en', suffix: '-en', cmds: loadCommands(join(HERE, 'commands', 'en')) });

// ── Emitters per tool ────────────────────────────────────────────────────────
const write = (p, content) => {
  if (DRY) { console.log(`   would write ${p}`); return; }
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, content);
  console.log(`   ✓ ${p}`);
};

function fm(obj) {
  const lines = Object.entries(obj).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function installClaude(dest) {
  // Claude reads frontmatter incl. allowed-tools — copy as-is into a namespaced folder.
  for (const set of SETS) for (const c of set.cmds) {
    const sub = set.lang === 'en' ? join(dest, 'en') : dest;
    write(join(sub, `${c.name}.md`), fm(c.meta) + c.body);
  }
}

function installCodex(dest) {
  // Codex prompts: description + argument-hint frontmatter, $ARGUMENTS supported.
  for (const set of SETS) for (const c of set.cmds) {
    const meta = {}; if (c.meta.description) meta.description = c.meta.description;
    if (c.meta['argument-hint']) meta['argument-hint'] = c.meta['argument-hint'];
    write(join(dest, `${c.name}${set.suffix}.md`), fm(meta) + c.body);
  }
}

function installAntigravity(dest) {
  // Antigravity: one on-demand skill bundling the whole workflow + command procedures.
  let skill = fm({
    name: 'knowledge-os',
    description: 'Company knowledge base (knowledge-os): query, ingest, lint, sync and deploy a Markdown knowledge base. Use when working inside a folder that has knowledge.config.json / INDEX.md / scripts/reindex.mjs.',
  });
  skill += `# knowledge-os\n\nA portable company knowledge base. Source of truth = \`.md\` files; \`scripts/reindex.mjs\` builds \`INDEX.md\` (for the LLM) and \`kb-data.js\` (for \`viewer.html\`). Read \`AGENTS.md\` in the base first.\n\nEngine (run in the base dir):\n\n\`\`\`\nnode scripts/reindex.mjs            # rebuild INDEX.md + kb-data.js\nnode scripts/reindex.mjs --lint     # health-check only\n\`\`\`\n\n## Procedures\n`;
  for (const c of (SETS.find(s => s.lang === 'en') || SETS[0]).cmds) {
    skill += `\n### ${c.name}\n${c.meta.description ? `_${c.meta.description}_\n` : ''}\n${c.body}\n`;
  }
  write(join(dest, 'SKILL.md'), skill);
}

const EMIT = { claude: installClaude, codex: installCodex, antigravity: installAntigravity };

// ── Run ──────────────────────────────────────────────────────────────────────
console.log(`\nknowledge-os installer${DRY ? ' (dry run)' : ''} · languages: ${SETS.map(s => s.lang).join(', ')}\n`);
const chosen = FORCED.length ? FORCED : Object.keys(TOOLS).filter(t => TOOLS[t].detect());
if (!chosen.length) {
  console.log('No supported tool detected (Claude Code / Codex / Antigravity).');
  console.log('Force one anyway, e.g.:  node install.mjs --tools=codex\n');
  process.exit(0);
}

const summary = [];
for (const t of chosen) {
  const tool = TOOLS[t];
  if (!tool) { console.log(`? Unknown tool "${t}" — skipping`); continue; }
  const present = tool.detect();
  console.log(`▸ ${tool.label}${present ? '' : ' (not detected — installing anyway, forced)'}`);
  EMIT[t](tool.dest);
  summary.push(`  ${tool.label}: ${tool.invoke}`);
  console.log('');
}

console.log('Done. How to use:');
console.log(summary.join('\n'));
console.log('\nAny tool also works with no install: open a base folder and let the assistant read AGENTS.md.\n');
