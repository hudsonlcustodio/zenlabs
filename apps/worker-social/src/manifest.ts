import type { QueueManifest } from './runtime';

export const manifest: QueueManifest = {
  process: 'worker-social',
  responsibility:
    'Publication, token refresh, performance collection and notifications.',
  queues: ['publish', 'metrics-collect', 'webhook-process', 'notification-send'],
};
