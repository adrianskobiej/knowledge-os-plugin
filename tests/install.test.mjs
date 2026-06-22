// Installer tests — black-box against install.mjs with an isolated HOME (zero deps).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const runInstall = (home, args) =>
  execFileSync('node', ['install.mjs', ...args], { cwd: ROOT, env: { ...process.env, HOME: home }, encoding: 'utf8' });

test('installs adapters per tool; Codex prompt drops allowed-tools', () => {
  const home = mkdtempSync(join(tmpdir(), 'kb-home-'));
  runInstall(home, ['--tools=claude,codex,antigravity', '--no-awareness']);
  assert.ok(existsSync(join(home, '.claude/commands/knowledge-os/kb-query.md')), 'Claude command installed');
  assert.ok(existsSync(join(home, '.codex/prompts/kb-init.md')), 'Codex prompt installed');
  assert.ok(existsSync(join(home, '.gemini/skills/knowledge-os/SKILL.md')), 'Antigravity skill installed');
  const codex = readFileSync(join(home, '.codex/prompts/kb-init.md'), 'utf8');
  assert.ok(!codex.includes('allowed-tools'), 'Codex prompt must not carry allowed-tools');
  const skill = readFileSync(join(home, '.gemini/skills/knowledge-os/SKILL.md'), 'utf8');
  assert.match(skill, /name: knowledge-os/);
});

test('global awareness registers a base and injects an idempotent block', () => {
  const home = mkdtempSync(join(tmpdir(), 'kb-home2-'));
  mkdirSync(join(home, 'knowledge', 'acme'), { recursive: true });
  writeFileSync(join(home, 'knowledge', 'acme', 'knowledge.config.json'), '{"company":{"name":"Acme"}}');

  runInstall(home, ['--tools=claude']);
  const reg = JSON.parse(readFileSync(join(home, '.config/knowledge-os/bases.json'), 'utf8'));
  assert.ok(reg.bases.some((b) => b.endsWith(join('knowledge', 'acme'))), 'base registered');
  const claudeMd = readFileSync(join(home, '.claude/CLAUDE.md'), 'utf8');
  assert.match(claudeMd, /knowledge-os:begin/);

  runInstall(home, ['--tools=claude']); // second run must not duplicate
  const after = readFileSync(join(home, '.claude/CLAUDE.md'), 'utf8');
  assert.equal((after.match(/knowledge-os:begin/g) || []).length, 1, 'awareness block is idempotent');
});

test('--dry-run writes nothing', () => {
  const home = mkdtempSync(join(tmpdir(), 'kb-home3-'));
  runInstall(home, ['--tools=codex', '--dry-run']);
  assert.ok(!existsSync(join(home, '.codex/prompts/kb-init.md')), 'dry-run must not write');
});
