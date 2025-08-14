// @ts-nocheck
import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { getOutputCapacityFactor } from '../capacity.ts';
import { ensureCapacityCache } from '../../state/capacityCache.ts';

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

  test('capacity factor caps outputs at storage limit', () => {
    const state = deepClone(defaultState);
    ensureCapacityCache(state);
    const resources = { wood: { amount: 79.8 } };
    const desired = { wood: 1 };
    const factor = getOutputCapacityFactor(state, resources, desired, 0, 0);
    expect(factor).toBeCloseTo(0.2, 5);
  });
});
