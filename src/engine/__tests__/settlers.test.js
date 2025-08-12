import { describe, it, expect } from 'vitest';
import { processTick } from '../production.js';
import { processSettlersTick, computeRoleBonuses } from '../settlers.js';
import { getResourceRates } from '../../state/selectors.js';
import { defaultState } from '../../state/defaultState.js';
import { RESOURCES } from '../../data/resources.js';
import { BALANCE } from '../../data/balance.js';

const clone = (obj) => structuredClone(obj);

describe('settlers tick', () => {
  it('keeps potato totals consistent with farming bonus and consumption', () => {
    const state = clone(defaultState);
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
      totalFoodProdBase * ((roleBonuses['farmer'] || 0) / 100);

    const { state: final } = processSettlersTick(
      afterTick,
      1,
      bonusFoodPerSec,
    );

    const expected =
      afterTick.resources.potatoes.amount +
      bonusFoodPerSec -
      BALANCE.FOOD_CONSUMPTION_PER_SETTLER;

    expect(final.resources.potatoes.amount).toBeCloseTo(expected, 5);
  });
});
