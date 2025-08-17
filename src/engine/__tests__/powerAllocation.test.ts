import { describe, test, expect } from 'vitest';
import { processTick } from '../production.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import type {
  GameState,
  BuildingEntry,
  ResourceState,
} from '../../state/useGame.tsx';

interface PowerStatus {
  supply: number;
  demand: number;
  stored: number;
  capacity: number;
}

type GameStateWithPower = GameState & { powerStatus: PowerStatus };

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

// Test cases described in user instruction

describe('power storage and allocation', () => {
  test('excess supply charges storage up to capacity', () => {
    const { state, buildings, resources } = clone();
    buildings.woodGenerator = { count: 1, isDesiredOn: true };
    resources.wood.amount = 50;
    resources.wood.discovered = true;
    resources.power.amount = 10;
    resources.power.discovered = true;

    const next = processTick(state, 15);
    const nextResources = next.resources as Record<string, ResourceState>;
    expect(nextResources.power.amount).toBe(20);
  });

  test('deficit drains storage until empty', () => {
    const { state, buildings, resources } = clone();
    buildings.radio = { count: 1, isDesiredOn: true };
    resources.power.amount = 1;
    resources.power.discovered = true;

    const next = processTick(state, 10);
    const nextResources = next.resources as Record<string, ResourceState>;
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    expect(nextResources.power.amount).toBeCloseTo(0, 5);
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
  });

  test('storage sustains ON buildings until depleted', () => {
    let { state, buildings, resources } = clone();
    buildings.radio = { count: 1, isDesiredOn: true };
    resources.power.amount = 0.2;
    resources.power.discovered = true;

    let next = processTick(state, 1);
    let nextBuildings = next.buildings as Record<string, BuildingEntry>;
    let nextResources = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextResources.power.amount).toBeCloseTo(0.1, 5);

    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextResources = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextResources.power.amount).toBeCloseTo(0, 5);

    next = processTick(next, 1);
    nextBuildings = next.buildings as Record<string, BuildingEntry>;
    nextResources = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBe('power');
    expect(nextResources.power.amount).toBeCloseTo(0, 5);
  });

  test('allocation honors powerTypeOrder when energy is insufficient', () => {
    const { state, buildings, resources } = clone();
    buildings.radio = { count: 1, isDesiredOn: true };
    buildings.toolsmithy = { count: 1, isDesiredOn: true };
    resources.power.amount = 0.4;
    resources.power.discovered = true;
    resources.planks.amount = 10;
    resources.planks.discovered = true;
    resources.metalParts.amount = 10;
    resources.metalParts.discovered = true;
    state.powerTypeOrder = ['radio', 'toolsmithy'];

    const next = processTick(state, 1);
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    const nextResources = next.resources as Record<string, ResourceState>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('power');
    expect(nextResources.power.amount).toBeCloseTo(0.3, 5);
  });

  test('turning ON higher-priority building displaces lower-priority consumers', () => {
    const {
      state: base,
      buildings: baseBuildings,
      resources: baseResources,
    } = clone();
    baseBuildings.toolsmithy = { count: 1, isDesiredOn: true };
    baseBuildings.radio = { count: 1, isDesiredOn: false };
    baseResources.power.amount = 0.4;
    baseResources.power.discovered = true;
    baseResources.planks.amount = 10;
    baseResources.planks.discovered = true;
    baseResources.metalParts.amount = 10;
    baseResources.metalParts.discovered = true;
    base.powerTypeOrder = ['radio', 'toolsmithy'];

    const powered = processTick(base, 1);
    const poweredBuildings = powered.buildings as Record<string, BuildingEntry>;
    const poweredResources = powered.resources as Record<string, ResourceState>;
    expect(poweredBuildings.toolsmithy?.offlineReason).toBeUndefined();
    expect(poweredResources.power.amount).toBeCloseTo(0, 5);

    const withRadio = deepClone(base) as GameState;
    (withRadio.buildings as Record<string, BuildingEntry>).radio.isDesiredOn =
      true;
    (withRadio.resources as Record<string, ResourceState>).power.amount = 0.4;
    const next = processTick(withRadio, 1);
    const nextBuildings = next.buildings as Record<string, BuildingEntry>;
    expect(nextBuildings.radio?.offlineReason).toBeUndefined();
    expect(nextBuildings.toolsmithy?.offlineReason).toBe('power');
  });

  test('results are deterministic regardless of building order', () => {
    const makeState = (): GameState => {
      const s = deepClone(defaultState) as GameState;
      const res = s.resources as Record<string, ResourceState>;
      res.power.amount = 0.4;
      res.power.discovered = true;
      res.planks.amount = 10;
      res.planks.discovered = true;
      res.metalParts.amount = 10;
      res.metalParts.discovered = true;
      s.powerTypeOrder = ['radio', 'toolsmithy'];
      return s;
    };

    const stateA = makeState();
    const aBuildings = stateA.buildings as Record<string, BuildingEntry>;
    aBuildings.radio = { count: 1, isDesiredOn: true };
    aBuildings.toolsmithy = { count: 1, isDesiredOn: true };

    const stateB = makeState();
    const bBuildings = stateB.buildings as Record<string, BuildingEntry>;
    // insert in opposite order
    bBuildings.toolsmithy = { count: 1, isDesiredOn: true };
    bBuildings.radio = { count: 1, isDesiredOn: true };

    const resA = processTick(stateA, 1) as GameStateWithPower;
    const resB = processTick(stateB, 1) as GameStateWithPower;
    const resARes = resA.resources as Record<string, ResourceState>;
    const resBRes = resB.resources as Record<string, ResourceState>;
    const resABuildings = resA.buildings as Record<string, BuildingEntry>;
    const resBBuildings = resB.buildings as Record<string, BuildingEntry>;

    expect(resBRes.power.amount).toBeCloseTo(resARes.power.amount, 5);
    expect(resBBuildings.radio?.offlineReason).toBe(
      resABuildings.radio?.offlineReason,
    );
    expect(resBBuildings.toolsmithy?.offlineReason).toBe(
      resABuildings.toolsmithy?.offlineReason,
    );
    expect(resB.powerStatus).toEqual(resA.powerStatus);
  });
});
