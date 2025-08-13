import { describe, expect, test } from 'vitest';
import { getResourceRates } from '../selectors.js';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';

describe('getResourceRates', () => {
  test('respects capacity when nearly full', () => {
    const state = deepClone(defaultState);
    state.resources.wood.amount = 79.8;
    state.resources.wood.discovered = true;
    state.buildings = { loggingCamp: { count: 1 } };
    state.population = { settlers: [] };
    const rates = getResourceRates(state);
    expect(rates.wood.perSec).toBeCloseTo(0.2, 5);
  });
});
