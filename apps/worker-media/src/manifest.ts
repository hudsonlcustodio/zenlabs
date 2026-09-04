import type { QueueManifest } from './runtime';

export const manifest: QueueManifest = {
  process: 'worker-media',
  responsibility:
    'Media routing, voice/media generation, provider reconciliation, ingestion, repair and assembly.',
  queues: [
    'voice-synthesize',
    'media-generate',
    'media-ingest',
    'media-repair',
    'assembly',
    'webhook-process',
  ],
};
