import { describe, it, expect, vi } from 'vitest';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { calculateFoodCapacity } from '../selectors.js';
import { DAYS_PER_YEAR, SECONDS_PER_DAY } from '../../engine/time.ts';

const fakeCandidate = { id: 'cand1' };
vi.mock('../../engine/candidates.ts', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

// Test that offline gains produce log entries

describe('prepareLoadedState', () => {
  it('adds offline progress entries to log', () => {
    const loaded = deepClone(defaultState);
    loaded.lastSaved = Date.now() - 10000; // 10 seconds offline
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
      lastSaved: now - 5000,
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

  it('ages settlers and advances year after offline progress', () => {
    const now = Date.now();
    const elapsed = DAYS_PER_YEAR * SECONDS_PER_DAY; // one year
    const loaded = {
      population: { settlers: [{ id: 1, ageDays: 0 }] },
      lastSaved: now - elapsed * 1000,
    };
    const state = prepareLoadedState(loaded);
    expect(state.gameTime.year).toBe(2);
    expect(state.population.settlers[0].ageDays).toBe(elapsed / SECONDS_PER_DAY);
  });
});
