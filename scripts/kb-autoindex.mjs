#!/usr/bin/env node
// Hook PostToolUse (Write|Edit): jeśli zmieniony plik leży w bazie wiedzy,
// regeneruje INDEX.md + kb-data.js tej bazy. Wejście (JSON huka) czyta ze stdin.
// Zawsze kończy kodem 0 — nigdy nie blokuje edycji.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { /* brak stdin */ }

let file = '';
try {
  const data = JSON.parse(input);
  file = (data.tool_input && data.tool_input.file_path) || '';
} catch { /* nie-JSON */ }

if (!file) process.exit(0);

// Znajdź korzeń bazy: pierwszy przodek zawierający knowledge.config.json.
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

try { execFileSync('node', [script], { cwd: root, stdio: 'ignore' }); } catch { /* nie blokuj */ }
process.exit(0);
