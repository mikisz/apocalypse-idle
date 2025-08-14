// @ts-nocheck
import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';

describe('power shortages', () => {
  test('buildings go offline when power runs out and recover when restored', () => {
    const state = deepClone(defaultState);
    state.buildings.radio = { count: 1 };
    state.resources.power.amount = 0.15;
    state.resources.power.discovered = true;

    let next = processTick(state, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0.05, 5);

    next = processTick(next, 1);
    expect(next.buildings.radio.offlineReason).toBe('power');
    expect(next.resources.power.amount).toBeCloseTo(0.05, 5);

    next.resources.power.amount = 1;
    next = processTick(next, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0.9, 5);
  });

  test('power allocated according to priority order', () => {
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

  test('buildings stop on resource shortage', () => {
    const state = deepClone(defaultState);
    state.buildings.sawmill = { count: 1, isDesiredOn: true };
    state.buildings.loggingCamp.count = 0;
    state.resources.wood.amount = 0.5;
    state.resources.wood.discovered = true;

    const next = processTick(state, 1);
    expect(next.buildings.sawmill.offlineReason).toBe('resources');
    expect(next.resources.wood.amount).toBeCloseTo(0.5, 5);
  });
});
