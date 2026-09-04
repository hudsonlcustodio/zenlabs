/**
 * FF-04 — "Module dependency graph is a DAG with declared edges only."
 * architecture.md §4.1 (dependency rules) and §4.2 (layering).
 *
 * Pure analysis library. It takes a repository root and returns violations; it
 * never exits or prints. `ff-04-dependency-graph.mjs` is the CI entry point and
 * `test/architecture/ff-04.test.ts` drives this same library against seeded
 * fixture trees, so the check is proven to go red, not merely to go green.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';

/** architecture.md §4.1 rule 3 — forbidden imports from a `domain/` layer. */
export const DOMAIN_FORBIDDEN_IMPORTS = [
  { pattern: /^aws-sdk(\/|$)/, reason: 'aws-sdk' },
  { pattern: /^@aws-sdk\//, reason: 'aws-sdk' },
  { pattern: /^drizzle-orm(\/|$)/, reason: 'the ORM' },
  { pattern: /^pg(\/|$)/, reason: 'the database driver' },
  { pattern: /^postgres(\/|$)/, reason: 'the database driver' },
  { pattern: /^openai(\/|$)/i, reason: 'a provider SDK' },
  { pattern: /^@deepseek\//i, reason: 'a provider SDK' },
  { pattern: /heygen/i, reason: 'a provider SDK' },
  { pattern: /elevenlabs/i, reason: 'a provider SDK' },
  { pattern: /^facebook-nodejs/i, reason: 'a provider SDK' },
  { pattern: /tiktok/i, reason: 'a provider SDK' },
  { pattern: /^@zenlabs\/providers(\/|$)/, reason: 'packages/providers' },
  { pattern: /^@zenlabs\/database(\/|$)/, reason: 'packages/database' },
];

const SOURCE_EXT = /\.(ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Extract module specifiers from a source file.
 * Covers static imports, re-exports, `require()` and dynamic `import()`.
 */
export function extractImports(source) {
  // Strip comments so a commented-out import is not reported.
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

  const specs = [];
  const patterns = [
    /\bimport\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:[\w*{},\s]+\s+)?from\s+['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code)) !== null) specs.push(m[1]);
  }
  return specs;
}

/** Read a JSON file, returning null when absent or unparseable. */
function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Find every elementary cycle in a directed graph.
 * Returns cycles as node arrays, e.g. ['a','b','a'] so both edges are nameable.
 */
export function findCycles(graph) {
  const cycles = [];
  const seen = new Set();
  const stack = [];
  const onStack = new Set();

  function dfs(node) {
    stack.push(node);
    onStack.add(node);
    for (const next of graph[node] ?? []) {
      if (onStack.has(next)) {
        const start = stack.indexOf(next);
        const cycle = [...stack.slice(start), next];
        // Canonical key so the same cycle is reported once.
        const rotation = cycle.slice(0, -1);
        const key = [...rotation].sort().join('|') + `#${rotation.length}`;
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      } else if (graph[next]) {
        dfs(next);
      }
    }
    stack.pop();
    onStack.delete(node);
  }

  for (const node of Object.keys(graph)) dfs(node);
  return cycles;
}

/**
 * Workspace-level graph: apps/* and packages/* edges must be declared in each
 * workspace's `zenlabs.allowedDependencies` manifest, and must form a DAG.
 */
export function analyzeWorkspaceGraph(root) {
  const violations = [];
  const graph = {};
  const manifests = {};

  for (const area of ['packages', 'apps']) {
    const base = join(root, area);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(base, entry.name, 'package.json');
      const pkg = readJson(pkgPath);
      if (!pkg) continue;
      const name = pkg.name;
      manifests[name] = pkg;

      if (!pkg.zenlabs || !Array.isArray(pkg.zenlabs.allowedDependencies)) {
        violations.push({
          rule: 'missing-manifest',
          workspace: name,
          message: `${area}/${entry.name} does not declare zenlabs.allowedDependencies (architecture.md §4.1 rule 1)`,
        });
      }

      const allowed = new Set(pkg.zenlabs?.allowedDependencies ?? []);
      const edges = Object.keys({ ...pkg.dependencies }).filter((d) => d.startsWith('@zenlabs/'));
      graph[name] = edges;

      for (const edge of edges) {
        if (!allowed.has(edge)) {
          violations.push({
            rule: 'undeclared-edge',
            workspace: name,
            to: edge,
            message: `undeclared edge ${name} -> ${edge}: not present in zenlabs.allowedDependencies`,
          });
        }
      }
    }
  }

  for (const cycle of findCycles(graph)) {
    const edges = [];
    for (let i = 0; i < cycle.length - 1; i += 1) edges.push(`${cycle[i]} -> ${cycle[i + 1]}`);
    violations.push({
      rule: 'cycle',
      cycle,
      edges,
      message: `dependency cycle: ${cycle.join(' -> ')} (edges: ${edges.join(', ')})`,
    });
  }

  return { graph, manifests, violations };
}

function layerOf(relativePath) {
  const parts = relativePath.split(sep);
  for (const layer of ['domain', 'application', 'infrastructure']) {
    if (parts.includes(layer)) return layer;
  }
  return null;
}

/**
 * Module-level graph under `apps/api/src/modules/<name>`.
 *
 * Enforces architecture.md §4.1:
 *   1. a module may depend only on modules in its `allowedDependencies`;
 *   2. no module may import another module's `infrastructure/` or `domain/`;
 *   4. no cycles;
 * and §4.1 rule 3 / §4.2: a `domain/` layer may not import a provider SDK,
 * aws-sdk or the ORM.
 *
 * The rule set is complete now even though the modules it constrains arrive in
 * P2/P4 — that ordering is the stated rationale of epic P1.
 */
export function analyzeModuleGraph(root, modulesDir = join('apps', 'api', 'src', 'modules')) {
  const violations = [];
  const graph = {};
  const base = join(root, modulesDir);
  if (!existsSync(base) || !statSync(base).isDirectory()) {
    return { graph, violations, moduleCount: 0 };
  }

  const modules = readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const allowedByModule = {};
  for (const name of modules) {
    const manifest = readJson(join(base, name, 'module.manifest.json'));
    if (!manifest || !Array.isArray(manifest.allowedDependencies)) {
      violations.push({
        rule: 'missing-manifest',
        module: name,
        message: `module "${name}" does not declare allowedDependencies in module.manifest.json (architecture.md §4.1 rule 1)`,
      });
      allowedByModule[name] = [];
    } else {
      allowedByModule[name] = manifest.allowedDependencies;
    }
    graph[name] = [];
  }

  for (const name of modules) {
    const moduleRoot = join(base, name);
    for (const file of walk(moduleRoot)) {
      const rel = relative(root, file);
      const layer = layerOf(relative(moduleRoot, file));
      const specs = extractImports(readFileSync(file, 'utf8'));

      for (const spec of specs) {
        // §4.1 rule 3 / §4.2 — the domain layer is pure.
        if (layer === 'domain') {
          for (const { pattern, reason } of DOMAIN_FORBIDDEN_IMPORTS) {
            if (pattern.test(spec)) {
              violations.push({
                rule: 'domain-forbidden-import',
                module: name,
                file: rel,
                import: spec,
                message: `${rel}: domain/ may not import ${reason} ("${spec}") — architecture.md §4.1 rule 3`,
              });
            }
          }
        }

        // Resolve the target module, if this import crosses a module boundary.
        let targetPath = null;
        if (spec.startsWith('.')) {
          targetPath = relative(base, resolve(dirname(file), spec));
        } else {
          const m = spec.match(/(?:^|\/)modules\/(.+)$/);
          if (m) targetPath = m[1];
        }
        if (!targetPath || targetPath.startsWith('..')) continue;

        const segments = targetPath.split(/[\\/]/);
        const targetModule = segments[0];
        if (!targetModule || targetModule === name) continue;
        if (!modules.includes(targetModule)) continue;

        // §4.1 rule 2 — internals of another module are unreachable.
        const targetLayer = segments[1];
        if (targetLayer === 'infrastructure' || targetLayer === 'domain') {
          violations.push({
            rule: 'cross-module-internals',
            module: name,
            to: targetModule,
            file: rel,
            import: spec,
            message: `${rel}: "${spec}" imports ${targetModule}'s ${targetLayer}/ internals — architecture.md §4.1 rule 2`,
          });
        }

        if (!graph[name].includes(targetModule)) graph[name].push(targetModule);

        // §4.1 rule 1 — the edge must be declared.
        if (!allowedByModule[name].includes(targetModule)) {
          violations.push({
            rule: 'undeclared-edge',
            module: name,
            to: targetModule,
            file: rel,
            import: spec,
            message: `${rel}: undeclared edge ${name} -> ${targetModule} (not in allowedDependencies) — architecture.md §4.1 rule 1`,
          });
        }
      }
    }
  }

  // §4.1 rule 4 — the graph is a DAG.
  for (const cycle of findCycles(graph)) {
    const edges = [];
    for (let i = 0; i < cycle.length - 1; i += 1) edges.push(`${cycle[i]} -> ${cycle[i + 1]}`);
    violations.push({
      rule: 'cycle',
      cycle,
      edges,
      message: `module dependency cycle: ${cycle.join(' -> ')} (edges: ${edges.join(', ')})`,
    });
  }

  return { graph, violations, moduleCount: modules.length };
}

/** Run every FF-04 analysis against a repository root. */
export function analyzeAll(root) {
  const workspace = analyzeWorkspaceGraph(root);
  const modules = analyzeModuleGraph(root);
  return {
    workspace,
    modules,
    violations: [...workspace.violations, ...modules.violations],
  };
}
