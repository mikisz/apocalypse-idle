import { describe, test, expect } from 'vitest';
import { processTick } from '../production.js';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';

// Test cases described in user instruction

describe('power storage and allocation', () => {
  test('excess supply charges storage up to capacity', () => {
    const state = deepClone(defaultState);
    state.buildings.woodGenerator = { count: 1, isDesiredOn: true };
    state.resources.wood.amount = 50;
    state.resources.wood.discovered = true;
    state.resources.power.amount = 10;
    state.resources.power.discovered = true;

    const next = processTick(state, 15);
    expect(next.resources.power.amount).toBe(20);
  });

  test('deficit drains storage until empty', () => {
    const state = deepClone(defaultState);
    state.buildings.radio = { count: 1, isDesiredOn: true };
    state.resources.power.amount = 1;
    state.resources.power.discovered = true;

    const next = processTick(state, 10);
    expect(next.resources.power.amount).toBeCloseTo(0, 5);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
  });

  test('storage sustains ON buildings until depleted', () => {
    let state = deepClone(defaultState);
    state.buildings.radio = { count: 1, isDesiredOn: true };
    state.resources.power.amount = 0.2;
    state.resources.power.discovered = true;

    let next = processTick(state, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0.1, 5);

    next = processTick(next, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.resources.power.amount).toBeCloseTo(0, 5);

    next = processTick(next, 1);
    expect(next.buildings.radio.offlineReason).toBe('power');
    expect(next.resources.power.amount).toBeCloseTo(0, 5);
  });

  test('allocation honors powerTypeOrder when energy is insufficient', () => {
    const state = deepClone(defaultState);
    state.buildings.radio = { count: 1, isDesiredOn: true };
    state.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    state.resources.power.amount = 0.4;
    state.resources.power.discovered = true;
    state.resources.planks.amount = 10;
    state.resources.planks.discovered = true;
    state.resources.metalParts.amount = 10;
    state.resources.metalParts.discovered = true;
    state.powerTypeOrder = ['radio', 'toolsmithy'];

    const next = processTick(state, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.buildings.toolsmithy.offlineReason).toBe('power');
    expect(next.resources.power.amount).toBeCloseTo(0.3, 5);
  });

  test('turning ON higher-priority building displaces lower-priority consumers', () => {
    const base = deepClone(defaultState);
    base.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    base.buildings.radio = { count: 1, isDesiredOn: false };
    base.resources.power.amount = 0.4;
    base.resources.power.discovered = true;
    base.resources.planks.amount = 10;
    base.resources.planks.discovered = true;
    base.resources.metalParts.amount = 10;
    base.resources.metalParts.discovered = true;
    base.powerTypeOrder = ['radio', 'toolsmithy'];

    const powered = processTick(base, 1);
    expect(powered.buildings.toolsmithy.offlineReason).toBeUndefined();
    expect(powered.resources.power.amount).toBeCloseTo(0, 5);

    const withRadio = deepClone(base);
    withRadio.buildings.radio.isDesiredOn = true;
    withRadio.resources.power.amount = 0.4;
    const next = processTick(withRadio, 1);
    expect(next.buildings.radio.offlineReason).toBeUndefined();
    expect(next.buildings.toolsmithy.offlineReason).toBe('power');
  });

  test('results are deterministic regardless of building order', () => {
    const makeState = () => {
      const s = deepClone(defaultState);
      s.resources.power.amount = 0.4;
      s.resources.power.discovered = true;
      s.resources.planks.amount = 10;
      s.resources.planks.discovered = true;
      s.resources.metalParts.amount = 10;
      s.resources.metalParts.discovered = true;
      s.powerTypeOrder = ['radio', 'toolsmithy'];
      return s;
    };

    const stateA = makeState();
    stateA.buildings.radio = { count: 1, isDesiredOn: true };
    stateA.buildings.toolsmithy = { count: 1, isDesiredOn: true };

    const stateB = makeState();
    // insert in opposite order
    stateB.buildings.toolsmithy = { count: 1, isDesiredOn: true };
    stateB.buildings.radio = { count: 1, isDesiredOn: true };

    const resA = processTick(stateA, 1);
    const resB = processTick(stateB, 1);

    expect(resB.resources.power.amount).toBeCloseTo(resA.resources.power.amount, 5);
    expect(resB.buildings.radio.offlineReason).toBe(resA.buildings.radio.offlineReason);
    expect(resB.buildings.toolsmithy.offlineReason).toBe(
      resA.buildings.toolsmithy.offlineReason,
    );
    expect(resB.powerStatus).toEqual(resA.powerStatus);
  });
});
