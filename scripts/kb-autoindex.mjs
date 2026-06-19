#!/usr/bin/env node
// PostToolUse hook (Write|Edit): if the changed file lives inside a knowledge base,
// regenerate that base's INDEX.md + kb-data.js. Reads the hook JSON from stdin.
// Always exits 0 — never blocks an edit.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { /* no stdin */ }

let file = '';
try {
  const data = JSON.parse(input);
  file = (data.tool_input && data.tool_input.file_path) || '';
} catch { /* non-JSON */ }

if (!file) process.exit(0);

// Find the base root: nearest ancestor containing knowledge.config.json.
let dir = dirname(file);
let root = '';
while (true) {
  if (existsSync(join(dir, 'knowledge.config.json'))) { root = dir; break; }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!root) process.exit(0);

const script = join(root, 'scripts', 'reindex.mjs');
if (!existsSync(script)) process.exit(0);

try { execFileSync('node', [script], { cwd: root, stdio: 'ignore' }); } catch { /* don't block */ }
process.exit(0);
