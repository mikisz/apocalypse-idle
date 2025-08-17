import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { getOutputCapacityFactors } from '../capacity.ts';
import { ensureCapacityCache } from '../../state/capacityCache.ts';
import {
  PRODUCTION_BUILDINGS,
  BUILDING_MAP,
} from '../../data/buildings.js';
import type { Building } from '../../data/buildings.js';
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

describe('production building on/off and power allocation', () => {
  test('OFF avoids all consumption and production', () => {
    const { state, buildings, resources } = clone();
    buildings.toolsmithy = { count: 1, isDesiredOn: false };
    resources.power.amount = 1;
    resources.power.discovered = true;
    resources.planks.amount = 10;
    resources.planks.discovered = true;
    resources.metalParts.amount = 10;
    resources.metalParts.discovered = true;
    resources.tools.amount = 0;
    resources.tools.discovered = true;

    const next = processTick(state, 1);
    const nextRes = next.resources as Record<string, ResourceState>;
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    expect(nextRes.power.amount).toBeCloseTo(1, 5);
    expect(nextRes.planks.amount).toBeCloseTo(10, 5);
    expect(nextRes.metalParts.amount).toBeCloseTo(10, 5);
    expect(nextRes.tools.amount).toBeCloseTo(0, 5);
    expect(nextBuildings.toolsmithy?.offlineReason).toBeUndefined();
  });

  test('ON with no power shows shortage and consumes nothing', () => {
    const { state, buildings, resources } = clone();
    buildings.toolsmithy = { count: 1, isDesiredOn: true };
    resources.power.amount = 0;
    resources.power.discovered = true;
    resources.planks.amount = 10;
    resources.planks.discovered = true;
    resources.metalParts.amount = 10;
    resources.metalParts.discovered = true;
    resources.tools.amount = 0;
    resources.tools.discovered = true;

    const next = processTick(state, 1);
    const nextRes = next.resources as Record<string, ResourceState>;
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('power');
    expect(nextRes.power.amount).toBeCloseTo(0, 5);
    expect(nextRes.planks.amount).toBeCloseTo(10, 5);
    expect(nextRes.metalParts.amount).toBeCloseTo(10, 5);
    expect(nextRes.tools.amount).toBeCloseTo(0, 5);
  });

  test('ON auto-resumes when power and resources return', () => {
    const { state, buildings, resources } = clone();
    buildings.toolsmithy = { count: 1, isDesiredOn: true };
    resources.planks.amount = 1;
    resources.planks.discovered = true;
    resources.metalParts.amount = 1;
    resources.metalParts.discovered = true;
    resources.power.amount = 0;
    resources.power.discovered = true;
    resources.tools.amount = 0;
    resources.tools.discovered = true;

    let next = processTick(state, 1);
    let nextBuildings = next.buildings as Record<string, BuildingEntry>;
    let nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('power');

    nextRes.power.amount = 1;
    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.toolsmithy?.offlineReason).toBeUndefined();
    expect(nextRes.power.amount).toBeCloseTo(0.6, 5);
    expect(nextRes.planks.amount).toBeCloseTo(0.75, 5);
    expect(nextRes.metalParts.amount).toBeCloseTo(0.85, 5);
    expect(nextRes.tools.amount).toBeCloseTo(0.18, 5);

    nextRes.planks.amount = 0;
    nextRes.metalParts.amount = 0;
    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('resources');
    expect(nextRes.tools.amount).toBeCloseTo(0.18, 5);

    nextRes.planks.amount = 1;
    nextRes.metalParts.amount = 1;
    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextRes = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.toolsmithy?.offlineReason).toBeUndefined();
    expect(nextRes.power.amount).toBeCloseTo(0.2, 5);
    expect(nextRes.planks.amount).toBeCloseTo(0.75, 5);
    expect(nextRes.metalParts.amount).toBeCloseTo(0.85, 5);
    expect(nextRes.tools.amount).toBeCloseTo(0.36, 5);
  });

  test('priority allocation: higher-priority building preempts lower-priority', () => {
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

  test('capacity factors cap outputs individually', () => {
    const { state } = clone();
    ensureCapacityCache(state);
    const resources: Record<string, ResourceState> = {
      wood: { amount: 79.8 },
      stone: { amount: 0 },
    };
    const desired: Record<string, number> = { wood: 1, stone: 1 };
    const factors = getOutputCapacityFactors(state, resources, desired, 0, 0);
    expect(factors.wood).toBeCloseTo(0.2, 5);
    expect(factors.stone).toBeCloseTo(1, 5);
  });

  test('multi-output building clamps each resource separately', () => {
    const { state, buildings, resources } = clone();
    const dual: Building = {
      id: 'dual',
      outputsPerSecBase: { wood: 1, stone: 1 },
      costBase: {},
      costGrowth: 1,
      type: 'production',
      name: 'Dual',
    };
    PRODUCTION_BUILDINGS.push(dual);
    BUILDING_MAP[dual.id] = dual;
    buildings[dual.id] = { count: 1 };
    state.gameTime.seconds = 270; // ensure summer multipliers = 1
    resources.wood.amount = 79.5;
    resources.wood.discovered = true;
    resources.stone.amount = 0;
    resources.stone.discovered = true;
    const next = processTick(state, 1);
    const nextRes = next.resources as Record<string, ResourceState>;
    expect(nextRes.wood.amount).toBeCloseTo(80, 5);
    expect(nextRes.stone.amount).toBeCloseTo(1, 5);
    PRODUCTION_BUILDINGS.pop();
    delete BUILDING_MAP[dual.id];
  });
});
