import { MemoryStore } from './memory';
import type { Store } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __manifest_store: Store | undefined;
}

let booted = false;

function seedDev(store: Store): void {
  if (process.env.NODE_ENV === 'production') return;
  // Seed minimal dev fixtures so the UI counter is non-zero in dev.
  store.addSignature({ name: 'Dev Seed' });
}

export function getStore(): Store {
  if (!globalThis.__manifest_store) {
    globalThis.__manifest_store = new MemoryStore();
  }
  if (!booted) {
    booted = true;
    seedDev(globalThis.__manifest_store);
  }
  return globalThis.__manifest_store;
}
