import { describe, it, expect, vi } from 'vitest';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { calculateFoodCapacity } from '../selectors.js';
import { SECONDS_PER_DAY } from '../../engine/time.ts';

const fakeCandidate = { id: 'cand1' };
vi.mock('../../engine/candidates.ts', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

// Test that offline gains produce log entries

describe('prepareLoadedState', () => {
  it('adds offline progress entries to log', () => {
    const loaded = deepClone(defaultState);
    loaded.lastSaved = Date.now() - 20 * 60 * 1000; // 20 minutes offline
    const state = prepareLoadedState(loaded);
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.log[0].text).toMatch(/while offline/);
  });

  it('records radio contact during offline progress', () => {
    const now = Date.now();
    const loaded = {
      buildings: { radio: { count: 1 }, woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 3 },
      lastSaved: now - 20 * 60 * 1000,
    };
    const state = prepareLoadedState(loaded);
    expect(state.population.candidate).toEqual(fakeCandidate);
    expect(state.ui.offlineProgress?.candidates).toContain(
      'Someone responded to the radio',
    );
  });

  it('defaults missing building flags to true', () => {
    const loaded = { buildings: { loggingCamp: { count: 3 } } };
    const state = prepareLoadedState(loaded);
    expect(state.buildings.loggingCamp.isDesiredOn).toBe(true);
  });

  it('preserves existing isDesiredOn flags', () => {
    const loaded = {
      buildings: { loggingCamp: { count: 3, isDesiredOn: false } },
    };
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
    expect(state.foodPool.capacity).toBe(calculateFoodCapacity(state));
  });

  it('caps offline progress and ages settlers accordingly', () => {
    const now = Date.now();
    const loaded = {
      population: { settlers: [{ id: 1, ageDays: 0 }] },
      lastSaved: now - 6 * 24 * 60 * 60 * 1000, // 6 days offline
    };
    const state = prepareLoadedState(loaded);
    const capped = 12 * 60 * 60; // 12 hours
    expect(state.gameTime.seconds).toBe(capped);
    expect(state.population.settlers[0].ageDays).toBe(capped / SECONDS_PER_DAY);
  });

  it('ignores short offline periods', () => {
    const loaded = deepClone(defaultState);
    loaded.lastSaved = Date.now() - 5 * 60 * 1000; // 5 minutes offline
    const state = prepareLoadedState(loaded);
    expect(state.ui.offlineProgress).toBeNull();
    expect(state.log.length).toBe(0);
  });

  it('reports capped elapsed time', () => {
    const loaded = deepClone(defaultState);
    loaded.lastSaved = Date.now() - 24 * 60 * 60 * 1000; // 24 hours offline
    const state = prepareLoadedState(loaded);
    expect(state.ui.offlineProgress?.elapsed).toBe(12 * 60 * 60);
  });
});
