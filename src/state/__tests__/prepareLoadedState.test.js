import { describe, it, expect } from 'vitest';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { getFoodCapacity } from '../selectors.js';

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

  it('preserves existing isDesiredOn flags', () => {
    const loaded = { buildings: { loggingCamp: { count: 3, isDesiredOn: false } } };
    const state = prepareLoadedState(loaded);
    expect(state.buildings.loggingCamp.isDesiredOn).toBe(false);
  });

  it('initializes missing powerStatus', () => {
    const state = prepareLoadedState({});
    expect(state.powerStatus).toEqual({
      supply: 0,
      demand: 0,
      stored: 0,
      capacity: 0,
    });
  });

  it('computes foodPool from resources when missing', () => {
    const loaded = {
      resources: {
        potatoes: { amount: 10, discovered: true, produced: 0 },
        meat: { amount: 5, discovered: true, produced: 0 },
      },
    };
    const state = prepareLoadedState(loaded);
    expect(state.foodPool.amount).toBe(15);
    expect(state.foodPool.capacity).toBe(getFoodCapacity(state));
  });
});
