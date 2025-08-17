import { describe, expect, test } from 'vitest';
import { getResourceRates } from '../selectors.js';
import { PRODUCTION_BUILDINGS, BUILDING_MAP } from '../../data/buildings.js';
import { defaultState } from '../defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { getOutputCapacityFactors } from '../../engine/capacity.ts';
import { ensureCapacityCache } from '../capacityCache.ts';

describe('getResourceRates', () => {
  test('respects capacity when nearly full', () => {
    const state = deepClone(defaultState);
    state.resources.wood.amount = 49.8;
    state.resources.wood.discovered = true;
    state.buildings = { loggingCamp: { count: 1 } };
    state.population = { settlers: [] };
    const rates = getResourceRates(state);
    expect(rates.wood.perSec).toBeCloseTo(0.2, 5);
  });

  test('capacity utility works with numeric resources', () => {
    const state = deepClone(defaultState);
    ensureCapacityCache(state);
    const resources = { wood: 49.8, stone: 0 };
    const desired = { wood: 1, stone: 1 };
    const factors = getOutputCapacityFactors(state, resources, desired, 0, 0);
    expect(factors.wood).toBeCloseTo(0.2, 5);
    expect(factors.stone).toBeCloseTo(1, 5);
  });

  test('rates handle multi-output buildings', () => {
    const state = deepClone(defaultState);
    const dual = {
      id: 'dual',
      outputsPerSecBase: { wood: 1, stone: 1 },
    };
    PRODUCTION_BUILDINGS.push(dual);
    BUILDING_MAP[dual.id] = dual;
    state.buildings = { dual: { count: 1 } };
    state.gameTime.seconds = 270; // summer for neutral multipliers
    state.population = { settlers: [] };
    state.resources.wood.amount = 49.5;
    state.resources.wood.discovered = true;
    state.resources.stone.amount = 0;
    state.resources.stone.discovered = true;
    const rates = getResourceRates(state);
    expect(rates.wood.perSec).toBeCloseTo(0.5, 5);
    expect(rates.stone.perSec).toBeCloseTo(1, 5);
    PRODUCTION_BUILDINGS.pop();
    delete BUILDING_MAP[dual.id];
  });
});
