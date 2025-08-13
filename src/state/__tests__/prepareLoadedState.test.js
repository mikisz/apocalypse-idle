import { describe, it, expect } from 'vitest';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';

// Test that offline gains produce log entries

describe('prepareLoadedState', () => {
  it('adds offline progress entries to log', () => {
    const loaded = deepClone(defaultState);
    loaded.lastSaved = Date.now() - 10000; // 10 seconds offline
    const state = prepareLoadedState(loaded);
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.log[0].text).toMatch(/while offline/);
  });

  it('defaults missing building flags to true', () => {
    const loaded = { buildings: { loggingCamp: { count: 3 } } };
    const state = prepareLoadedState(loaded);
    expect(state.buildings.loggingCamp.isDesiredOn).toBe(true);
  });
});
