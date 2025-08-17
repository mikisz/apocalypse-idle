import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import type {
  GameState,
  BuildingEntry,
  ResourceState,
} from '../../state/useGame.tsx';

function clone(): {
  state: GameState;
  buildings: Record<string, BuildingEntry>;
  resources: Record<string, ResourceState>;
} {
  const state = deepClone(defaultState) as GameState;
  return {
    state,
    buildings: state.buildings as Record<string, BuildingEntry>,
    resources: state.resources as Record<string, ResourceState>,
  };
}

describe('power shortages', () => {
  test('buildings go offline when power runs out and recover when restored', () => {
    const { state, buildings, resources } = clone();
    buildings.radio = { count: 1 };
    resources.power.amount = 0.15;
    resources.power.discovered = true;

    let next = processTick(state, 1);
    let nextBuildings = next.buildings as Record<string, BuildingEntry>;
    let nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextRes.power.amount).toBeCloseTo(0.05, 5);

    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBe('power');
    expect(nextRes.power.amount).toBeCloseTo(0.05, 5);

    nextRes.power.amount = 1;
    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextRes.power.amount).toBeCloseTo(0.9, 5);
  });

  test('power allocated according to priority order', () => {
    const { state, buildings, resources } = clone();
    buildings.radio = { count: 1, isDesiredOn: true };
    buildings.toolsmithy = { count: 1, isDesiredOn: true };
    state.powerTypeOrder = ['radio', 'toolsmithy'];
    resources.power.amount = 0.1;
    resources.power.discovered = true;
    resources.planks.amount = 10;
    resources.planks.discovered = true;
    resources.metalParts.amount = 10;
    resources.metalParts.discovered = true;

    const next = processTick(state, 1);
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    const nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('power');
    expect(nextRes.power.amount).toBeCloseTo(0, 5);
  });

  test('buildings stop on resource shortage', () => {
    const { state, buildings, resources } = clone();
    buildings.sawmill = { count: 1, isDesiredOn: true };
    buildings.loggingCamp.count = 0;
    resources.wood.amount = 0.5;
    resources.wood.discovered = true;

    const next = processTick(state, 1);
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    const nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.sawmill?.offlineReason).toBe('resources');
    expect(nextRes.wood.amount).toBeCloseTo(0.5, 5);
  });
});
