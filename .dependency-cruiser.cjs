/**
 * dependency-cruiser configuration — the static half of FF-04.
 *
 * fitness-functions.md FF-04 asks for `dependency-cruiser` with `noCircular`
 * plus per-module declared edges. The declared-edge half is data-driven and
 * lives in scripts/fitness/lib/graph.mjs; the structural rules below are the
 * ones dependency-cruiser expresses best.
 *
 * FF-02 and FF-03 are deliberately out of scope here (P1.03 "Out of scope"):
 * they need packages/providers, which arrives in P4.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'architecture.md §4.1 rule 4 — the dependency graph is a DAG. A cycle is reported with every edge in it.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-cross-module-internals',
      severity: 'error',
      comment:
        "architecture.md §4.1 rule 2 — cross-module communication goes through published application services or domain events, never another module's domain/ or infrastructure/.",
      from: { path: '^apps/api/src/modules/([^/]+)/' },
      to: {
        path: '^apps/api/src/modules/([^/]+)/(domain|infrastructure)/',
        pathNot: '^apps/api/src/modules/$1/',
      },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment:
        'architecture.md §4.1 rule 3 / §4.2 — a domain layer imports contracts only. No provider SDK, no aws-sdk, no ORM.',
      from: { path: '^apps/api/src/modules/[^/]+/domain/' },
      to: {
        path:
          'node_modules/(aws-sdk|@aws-sdk|drizzle-orm|pg|postgres|openai|@deepseek|heygen|elevenlabs|facebook-nodejs|tiktok)',
      },
    },
    {
      name: 'domain-not-infrastructure',
      severity: 'error',
      comment:
        'architecture.md §4.2 — domain/ is pure; it may not reach into infrastructure/.',
      from: { path: '^apps/api/src/modules/[^/]+/domain/' },
      to: { path: '^apps/api/src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'application-not-infrastructure',
      severity: 'error',
      comment:
        'architecture.md §4.2 — application/ imports domain and ports, not infrastructure.',
      from: { path: '^apps/api/src/modules/[^/]+/application/' },
      to: { path: '^apps/api/src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'contracts-is-zero-io',
      severity: 'error',
      comment:
        'architecture.md §2.2 — packages/contracts has no dependencies and performs no I/O.',
      from: { path: '^packages/contracts/' },
      to: {
        path:
          'node_modules/(aws-sdk|@aws-sdk|drizzle-orm|pg|postgres|axios|node-fetch|got|undici|express|@nestjs|next)',
      },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|coverage|node_modules)(/|$)' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['require', 'node', 'import', 'default'],
      mainFields: ['main', 'types'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
