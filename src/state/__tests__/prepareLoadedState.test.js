import { describe, it, expect } from 'vitest';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import { defaultState } from '../defaultState.js';

// Test that offline gains produce log entries

describe('prepareLoadedState', () => {
  it('adds offline progress entries to log', () => {
    const loaded = JSON.parse(JSON.stringify(defaultState));
    loaded.lastSaved = Date.now() - 10000; // 10 seconds offline
    const state = prepareLoadedState(loaded);
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.log[0].text).toMatch(/while offline/);
  });
});
