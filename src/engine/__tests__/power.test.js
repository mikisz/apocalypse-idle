import { describe, test, expect } from 'vitest';
import { processTick } from '../production.js';
import { defaultState } from '../../state/defaultState.js';

const clone = (obj) => structuredClone(obj);

describe('power shortages', () => {
  test('buildings go offline when power runs out and recover when restored', () => {
    const state = clone(defaultState);
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
});
