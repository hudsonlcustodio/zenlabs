import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = process.cwd();
const WORKERS = ['worker-ai', 'worker-media', 'worker-social'];

function canonicalQueueTable() {
  const doc = readFileSync(join(ROOT, 'docs/architecture/aws-topology.md'), 'utf8');
  const section = doc.slice(doc.indexOf('## 6. Messaging'), doc.indexOf('## 7.'));
  const table = new Map();
  for (const line of section.split('\n')) {
    const match = line.match(/^\|\s*`([a-z-]+)`\s*\|\s*([^|]+?)\s*\|/);
    if (!match) continue;
    const [, queue, consumers] = match;
    table.set(queue, consumers.split('/').map((c) => c.trim()));
  }
  return table;
}

function readManifest(worker) {
  const source = readFileSync(join(ROOT, 'apps', worker, 'src', 'manifest.ts'), 'utf8');
  const queuesBlock = source.match(/queues:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
  const queues = [...queuesBlock.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
  const responsibility = source.match(/responsibility:\s*\n?\s*'([^']+)'/)?.[1];
  return { queues, responsibility };
}

const EXPECTED = [
  'knowledge-ingest',
  'content-generate',
  'production-analyze',
  'production-plan',
  'qc-evaluate',
  'voice-synthesize',
  'media-generate',
  'media-ingest',
  'media-repair',
  'assembly',
  'webhook-process',
  'publish',
  'metrics-collect',
  'notification-send',
];

const QUEUES = canonicalQueueTable();

describe('ZENLABS V2 canonical queue table', () => {
  it('declares exactly the expected queues', () => {
    expect([...QUEUES.keys()].sort()).toEqual([...EXPECTED].sort());
  });

  it.each(WORKERS)('%s has a non-empty manifest', (worker) => {
    const { queues, responsibility } = readManifest(worker);
    expect(queues.length).toBeGreaterThan(0);
    expect(responsibility).toBeTruthy();
  });

  it.each(WORKERS)('%s responsibility appears in architecture §2.1', (worker) => {
    const { responsibility } = readManifest(worker);
    const architecture = readFileSync(join(ROOT, 'docs/architecture/architecture.md'), 'utf8');
    expect(architecture).toContain(responsibility);
  });

  it.each(WORKERS)('%s only names canonical queues assigned to it', (worker) => {
    const { queues } = readManifest(worker);
    for (const queue of queues) {
      expect([...QUEUES.keys()]).toContain(queue);
      expect(QUEUES.get(queue)).toContain(worker);
    }
  });

  it('every canonical queue has a declared consumer', () => {
    const claimed = new Set(WORKERS.flatMap((w) => readManifest(w).queues));
    for (const queue of QUEUES.keys()) expect(claimed).toContain(queue);
  });
});
