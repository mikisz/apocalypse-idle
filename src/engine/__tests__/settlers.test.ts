// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { processTick } from '../production.ts';
import { processSettlersTick, computeRoleBonuses } from '../settlers.ts';
import { getResourceRates } from '../../state/selectors.js';
import { defaultState } from '../../state/defaultState.js';
import { RESOURCES } from '../../data/resources.js';
import { BALANCE } from '../../data/balance.js';
import { deepClone } from '../../utils/clone.ts';

const createRng = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe('settlers tick', () => {
  it('keeps potato totals consistent with farming bonus and consumption', () => {
    const rng = createRng();
    const state = deepClone(defaultState);
    state.buildings.potatoField.count = 1;
    state.resources.potatoes.amount = 0;
    state.population.settlers = [
      {
        id: 's1',
        role: 'farmer',
        skills: { farmer: { level: 1, xp: 0 } },
      },
    ];

    const roleBonuses = computeRoleBonuses(state.population.settlers);
    const productionBonuses = { ...roleBonuses };
    delete productionBonuses.farmer;
    const afterTick = processTick(state, 1, productionBonuses);

    const rates = getResourceRates(afterTick);
    let totalFoodProdBase = 0;
    Object.keys(RESOURCES).forEach((id) => {
      if (RESOURCES[id].category === 'FOOD') {
        totalFoodProdBase += rates[id]?.perSec || 0;
      }
    });
    const bonusFoodPerSec =
      totalFoodProdBase * (roleBonuses['farmer'] || 0);

    const { state: final } = processSettlersTick(afterTick, 1, bonusFoodPerSec, rng);

    const expected =
      afterTick.resources.potatoes.amount +
      bonusFoodPerSec -
      BALANCE.FOOD_CONSUMPTION_PER_SETTLER;

    expect(final.resources.potatoes.amount).toBeCloseTo(expected, 5);
  });

  it('clamps food once after bonus and consumption', () => {
    const rng2 = createRng(2);
    const state = deepClone(defaultState);
    const cap = 200;
    state.resources.potatoes.amount = cap;
    state.foodPool = { amount: cap, capacity: cap };
    state.population.settlers = [{ id: 's1' }];
    const bonusPerSec = BALANCE.FOOD_CONSUMPTION_PER_SETTLER + 0.1;
    const { state: next } = processSettlersTick(state, 1, bonusPerSec, rng2);
    expect(next.foodPool.amount).toBe(cap);
    expect(next.resources.potatoes.amount).toBe(cap);
  });
});
