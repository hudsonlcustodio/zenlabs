import type { QueueManifest } from './runtime';

export const manifest: QueueManifest = {
  process: 'worker-ai',
  responsibility:
    'Production analysis, planning, content intelligence, knowledge ingestion and AI quality evaluation.',
  queues: [
    'knowledge-ingest',
    'content-generate',
    'production-analyze',
    'production-plan',
    'qc-evaluate',
  ],
};
