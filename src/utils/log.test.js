import { describe, it, expect, afterEach } from 'vitest';
import { createLogEntry } from './log.js';

describe('createLogEntry', () => {
  const originalRandomUUID = globalThis.crypto.randomUUID;

  afterEach(() => {
    globalThis.crypto.randomUUID = originalRandomUUID;
  });

  it('generates unique ids by default', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(createLogEntry('test').id);
    }
    expect(ids.size).toBe(1000);
  });

  it('uses getRandomValues when randomUUID is missing', () => {
    globalThis.crypto.randomUUID = undefined;
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(createLogEntry('test').id);
    }
    expect(ids.size).toBe(1000);
  });
});
