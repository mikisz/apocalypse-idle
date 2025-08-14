// @ts-nocheck
import { describe, expect, test } from 'vitest';
import { processTick, demolishBuilding } from '../production.ts';
import { processSettlersTick } from '../settlers.ts';
import { defaultState } from '../../state/defaultState.js';
import { BUILDING_MAP, getBuildingCost } from '../../data/buildings.js';
import { SEASON_DURATION } from '../time.ts';
import { deepClone } from '../../utils/clone.ts';
import { BALANCE } from '../../data/balance.js';
import { calculateFoodCapacity } from '../../state/selectors.js';

describe('economy basics', () => {
  test('spring potato field output', () => {
    const state = deepClone(defaultState);
    state.buildings.potatoField.count = 1;
    const next = processTick(state, 1);
    const potatoes = next.resources.potatoes.amount;
    expect(potatoes).toBeCloseTo(0.375 * 1.25, 5);
  });

  test('demolition refunds half last cost', () => {
    const state = deepClone(defaultState);
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
    const state = deepClone(defaultState);
    state.resources.wood.amount = 10;
    state.buildings.loggingCamp.count = 0;
    state.buildings.sawmill = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.wood.amount).toBeCloseTo(9.2, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0.5, 5);
  });

  test('sawmill halts without enough wood', () => {
    const state = deepClone(defaultState);
    state.resources.wood.amount = 0.5;
    state.buildings.loggingCamp.count = 0;
    state.buildings.sawmill = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.wood.amount).toBeCloseTo(0.5, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0, 5);
  });

  test('sawmill respects plank capacity and partial runs', () => {
    const state = deepClone(defaultState);
    state.resources.wood.amount = 10;
    state.resources.planks.amount = 139.75;
    state.buildings.loggingCamp.count = 0;
    state.buildings.sawmill = { count: 1 };
    state.buildings.materialsDepot = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.planks.amount).toBeCloseTo(140, 5);
    expect(next.resources.wood.amount).toBeCloseTo(9.6, 5);
  });

  test('brick kiln converts stone and wood into bricks', () => {
    const state = deepClone(defaultState);
    state.resources.stone.amount = 1;
    state.resources.wood.amount = 1;
    state.buildings.loggingCamp.count = 0;
    state.buildings.brickKiln = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.bricks.amount).toBeCloseTo(0.4, 5);
    expect(next.resources.stone.amount).toBeCloseTo(0.6, 5);
    expect(next.resources.wood.amount).toBeCloseTo(0.7, 5);
  });

  test('removing last required building unassigns settlers', () => {
    const state = deepClone(defaultState);
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

  test("hunter's hut produces meat in winter", () => {
    const state = deepClone(defaultState);
    state.gameTime.seconds = SEASON_DURATION * 3;
    state.buildings.huntersHut = { count: 1 };
    const next = processTick(state, 1);
    expect(next.resources.meat.amount).toBeCloseTo(0.22 * 0.6, 5); // changed: 0.19*0.6 -> 0.22*0.6
  });

  test('food pool capacity shared across food types', () => {
    const state = deepClone(defaultState);
    state.buildings.potatoField.count = 1;
    const cap = calculateFoodCapacity(state);
    state.resources.meat.amount = cap - 0.1;
    state.resources.potatoes.amount = 0;
    state.foodPool = { amount: cap - 0.1, capacity: cap };
    const next = processTick(state, 1);
    expect(next.foodPool.amount).toBeCloseTo(cap, 5);
    expect(next.resources.potatoes.amount).toBeCloseTo(0.1, 5);
  });

  test('settlers consume from multiple food resources', () => {
    const state = deepClone(defaultState);
    const cap = calculateFoodCapacity(state);
    state.resources.potatoes.amount = 0.3;
    state.resources.meat.amount = 1;
    state.foodPool = { amount: 1.3, capacity: cap };
    state.population.settlers = [{ id: 's1' }, { id: 's2' }];
    const { state: after } = processSettlersTick(state, 1, 0);
    const consumption = 2 * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
    expect(after.resources.potatoes.amount).toBeCloseTo(
      Math.max(0, 0.3 - consumption),
      5,
    );
    expect(after.resources.meat.amount).toBeCloseTo(
      1 - Math.max(0, consumption - 0.3),
      5,
    );
    expect(after.foodPool.amount).toBeCloseTo(1.3 - consumption, 5);
  });
});
