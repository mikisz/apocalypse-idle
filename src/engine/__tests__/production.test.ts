// @ts-nocheck
import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { getOutputCapacityFactors } from '../capacity.ts';
import { ensureCapacityCache } from '../../state/capacityCache.ts';
import { PRODUCTION_BUILDINGS, BUILDING_MAP } from '../../data/buildings.js';

describe('production building on/off and power allocation', () => {
  test('OFF avoids all consumption and production', () => {
    const state = deepClone(defaultState);
    state.buildings.toolsmithy = { count: 1, isDesiredOn: false };
    state.resources.power.amount = 1;
    state.resources.power.discovered = true;
    state.resources.planks.amount = 10;
    state.resources.planks.discovered = true;
    state.resources.metalParts.amount = 10;
    state.resources.metalParts.discovered = true;
    state.resources.tools.amount = 0;
    state.resources.tools.discovered = true;

    const next = processTick(state, 1);
    expect(next.resources.power.amount).toBeCloseTo(1, 5);
    expect(next.resources.planks.amount).toBeCloseTo(10, 5);
    expect(next.resources.metalParts.amount).toBeCloseTo(10, 5);
    expect(next.resources.tools.amount).toBeCloseTo(0, 5);
    expect(next.buildings.toolsmithy.offlineReason).toBeUndefined();
  });

  test('ON with no power shows shortage and consumes nothing', () => {
    const state = deepClone(defaultState);
    state.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    state.resources.power.amount = 0;
    state.resources.power.discovered = true;
    state.resources.planks.amount = 10;
    state.resources.planks.discovered = true;
    state.resources.metalParts.amount = 10;
    state.resources.metalParts.discovered = true;
    state.resources.tools.amount = 0;
    state.resources.tools.discovered = true;

    const next = processTick(state, 1);
    expect(next.buildings.toolsmithy.offlineReason).toBe('power');
    expect(next.resources.power.amount).toBeCloseTo(0, 5);
    expect(next.resources.planks.amount).toBeCloseTo(10, 5);
    expect(next.resources.metalParts.amount).toBeCloseTo(10, 5);
    expect(next.resources.tools.amount).toBeCloseTo(0, 5);
  });

  test('ON auto-resumes when power and resources return', () => {
    const state = deepClone(defaultState);
    state.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    state.resources.planks.amount = 1;
    state.resources.planks.discovered = true;
    state.resources.metalParts.amount = 1;
    state.resources.metalParts.discovered = true;
    state.resources.power.amount = 0;
    state.resources.power.discovered = true;
    state.resources.tools.amount = 0;
    state.resources.tools.discovered = true;

    let next = processTick(state, 1);
    expect(next.buildings.toolsmithy.offlineReason).toBe('power');

    next.resources.power.amount = 1;
    next = processTick(next, 1);
    expect(next.buildings.toolsmithy.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0.6, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0.75, 5);
    expect(next.resources.metalParts.amount).toBeCloseTo(0.85, 5);
    expect(next.resources.tools.amount).toBeCloseTo(0.18, 5);

    next.resources.planks.amount = 0;
    next.resources.metalParts.amount = 0;
    next = processTick(next, 1);
    expect(next.buildings.toolsmithy.offlineReason).toBe('resources');
    expect(next.resources.tools.amount).toBeCloseTo(0.18, 5);

    next.resources.planks.amount = 1;
    next.resources.metalParts.amount = 1;
    next = processTick(next, 1);
    expect(next.buildings.toolsmithy.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0.2, 5);
    expect(next.resources.planks.amount).toBeCloseTo(0.75, 5);
    expect(next.resources.metalParts.amount).toBeCloseTo(0.85, 5);
    expect(next.resources.tools.amount).toBeCloseTo(0.36, 5);
  });

  test('priority allocation: higher-priority building preempts lower-priority', () => {
    const state = deepClone(defaultState);
    state.buildings.radio = { count: 1, isDesiredOn: true };
    state.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    state.powerTypeOrder = ['radio', 'toolsmithy'];
    state.resources.power.amount = 0.1;
    state.resources.power.discovered = true;
    state.resources.planks.amount = 10;
    state.resources.planks.discovered = true;
    state.resources.metalParts.amount = 10;
    state.resources.metalParts.discovered = true;

    const next = processTick(state, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.buildings.toolsmithy.offlineReason).toBe('power');
    expect(next.resources.power.amount).toBeCloseTo(0, 5);
  });

  test('capacity factors cap outputs individually', () => {
    const state = deepClone(defaultState);
    ensureCapacityCache(state);
    const resources = { wood: { amount: 79.8 }, stone: { amount: 0 } };
    const desired = { wood: 1, stone: 1 };
    const factors = getOutputCapacityFactors(state, resources, desired, 0, 0);
    expect(factors.wood).toBeCloseTo(0.2, 5);
    expect(factors.stone).toBeCloseTo(1, 5);
  });

  test('multi-output building clamps each resource separately', () => {
    const state = deepClone(defaultState);
    const dual = {
      id: 'dual',
      outputsPerSecBase: { wood: 1, stone: 1 },
    };
    PRODUCTION_BUILDINGS.push(dual);
    BUILDING_MAP[dual.id] = dual;
    state.buildings[dual.id] = { count: 1 };
    state.gameTime.seconds = 270; // ensure summer multipliers = 1
    state.resources.wood.amount = 79.5;
    state.resources.wood.discovered = true;
    state.resources.stone.amount = 0;
    state.resources.stone.discovered = true;
    const next = processTick(state, 1);
    expect(next.resources.wood.amount).toBeCloseTo(80, 5);
    expect(next.resources.stone.amount).toBeCloseTo(1, 5);
    PRODUCTION_BUILDINGS.pop();
    delete BUILDING_MAP[dual.id];
  });
});
