import { describe, it, expect } from 'vitest';
import { getResourceRates } from '../selectors.js';

describe('getResourceRates', () => {
  it('ignores buildings that are turned off', () => {
    const state = {
      resources: { wood: { amount: 0 } },
      buildings: { loggingCamp: { count: 1, isDesiredOn: false } },
      population: { settlers: [] },
      research: { completed: [] },
    };
    const rates = getResourceRates(state);
    expect(rates.wood.perSec).toBe(0);
  });
});
