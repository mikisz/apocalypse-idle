import { describe, expect, test } from 'vitest';
import { processTick, demolishBuilding } from '../production.js';
import { processSettlersTick } from '../settlers.js';
import { defaultState } from '../../state/defaultState.js';
import { BUILDING_MAP, getBuildingCost } from '../../data/buildings.js';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

describe('economy basics', () => {
  test('spring potato field output', () => {
    const state = clone(defaultState);
    const next = processTick(state, 1);
    const potatoes = next.resources.potatoes.amount;
    expect(potatoes).toBeCloseTo(0.375 * 1.25, 5);
  });

  test('demolition refunds half last cost', () => {
    const state = clone(defaultState);
    state.buildings.potatoField.count = 2;
    const after = demolishBuilding(state, 'potatoField');
    const blueprint = BUILDING_MAP['potatoField'];
    const prevCost = getBuildingCost(blueprint, 1);
    expect(after.buildings.potatoField.count).toBe(1);
    expect(after.resources.wood.amount).toBe(
      Math.floor(prevCost.wood * blueprint.refund),
    );
  });

  test('processSettlersTick handles default state', () => {
    const state = clone(defaultState);
    expect(() => processSettlersTick(state)).not.toThrow();
  });
});
