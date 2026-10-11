import { createHash } from 'node:crypto';
import coverExperimentScript from './cover-experiment.js?raw';

// Share the exact script bytes between the rendered HTML and its CSP allowance.
export { coverExperimentScript };
export const coverExperimentCspHash = `'sha256-${createHash('sha256')
  .update(coverExperimentScript, 'utf8')
  .digest('base64')}'`;
