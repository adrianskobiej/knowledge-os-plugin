// check-secrets.mjs tests — runs the scanner against a throwaway git repo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'check-secrets.mjs');

function repoWith(files) {
  const dir = mkdtempSync(join(tmpdir(), 'kb-sec-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  execFileSync('git', ['add', '-A'], { cwd: dir });
  return dir;
}
const scan = (dir) => {
  try { return { code: 0, out: execFileSync('node', [SCRIPT], { cwd: dir, encoding: 'utf8' }) }; }
  catch (e) { return { code: e.status, out: (e.stdout || '') + (e.stderr || '') }; }
};

test('passes on a clean repo', () => {
  const r = scan(repoWith({ 'a.md': '# Clean\nNothing secret here, just prose about tokens and secrets.\n' }));
  assert.equal(r.code, 0);
  assert.match(r.out, /No secrets detected/);
});

test('fails on a planted GitHub token', () => {
  const r = scan(repoWith({ 'leak.md': 'token = ghp_' + 'A'.repeat(32) + '\n' }));
  assert.equal(r.code, 1);
  assert.match(r.out, /GitHub personal access token/);
});
