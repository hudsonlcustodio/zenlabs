#!/usr/bin/env node
/**
 * FF-04 — Module dependency graph is a DAG with declared edges only.
 * fitness-functions.md FF-04 · architecture.md §4.1, §4.2
 *
 * Fails when a cycle or an undeclared edge is detected.
 * Usage: node scripts/fitness/ff-04-dependency-graph.mjs [--root <dir>]
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeAll } from './lib/graph.mjs';

const argv = process.argv.slice(2);
const rootFlag = argv.indexOf('--root');
const ROOT =
  rootFlag !== -1 && argv[rootFlag + 1]
    ? argv[rootFlag + 1]
    : join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const { workspace, modules, violations } = analyzeAll(ROOT);

const workspaceCount = Object.keys(workspace.graph).length;
console.log(
  `FF-04  workspaces=${workspaceCount}  modules=${modules.moduleCount}  violations=${violations.length}`,
);

if (violations.length === 0) {
  console.log('FF-04 PASS — graph is a DAG and every edge is declared.');
  process.exit(0);
}

console.error('\nFF-04 FAIL — architecture.md §4.1 / §4.2 violations:\n');
const byRule = violations.reduce((acc, v) => {
  (acc[v.rule] ??= []).push(v);
  return acc;
}, {});
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  [${rule}] ${items.length}`);
  for (const item of items) console.error(`    - ${item.message}`);
}
console.error('');
process.exit(1);
