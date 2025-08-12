import { describe, expect, test } from 'vitest';
import { processTick, demolishBuilding } from '../production.js';
import { defaultState } from '../../state/defaultState.js';
import { BUILDING_MAP, getBuildingCost } from '../../data/buildings.js';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

describe('economy basics', () => {
  test('spring potato field output', () => {
    const state = clone(defaultState);
    state.buildings.potatoField.count = 1;
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

  test('sawmill processes wood into planks when inputs available', () => {
    const state = clone(defaultState);
    state.resources.wood.amount = 10;
    state.buildings.loggingCamp.count = 0;
    state.buildings.sawmill = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.wood.amount).toBeCloseTo(9, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0.5, 5);
  });

  test('sawmill halts without enough wood', () => {
    const state = clone(defaultState);
    state.resources.wood.amount = 0.5;
    state.buildings.loggingCamp.count = 0;
    state.buildings.sawmill = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.wood.amount).toBeCloseTo(0.5, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0, 5);
  });

  test('removing last required building unassigns settlers', () => {
    const state = clone(defaultState);
    state.buildings.potatoField.count = 1;
    state.population = {
      settlers: [
        {
          id: 's1',
          firstName: 'A',
          lastName: 'B',
          role: 'farmer',
          skills: { farmer: { level: 3, xp: 0 } },
        },
      ],
    };
    const after = demolishBuilding(state, 'potatoField');
    expect(after.buildings.potatoField.count).toBe(0);
    const settler = after.population.settlers[0];
    expect(settler.role).toBe(null);
    expect(settler.skills.farmer.level).toBe(3);
  });
});
