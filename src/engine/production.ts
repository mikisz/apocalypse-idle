import {
  PRODUCTION_BUILDINGS,
  BUILDING_MAP,
  getBuildingCost,
  type Building as BuildingDefinition,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import {
  ROLE_BY_RESOURCE,
  BUILDING_ROLES,
  ROLE_BUILDINGS,
} from '../data/roles.js';
import { getSeason, getSeasonMultiplier } from './time.ts';
import { getResearchOutputBonus } from '../state/selectors.js';
import {
  getCapacity,
  calculateFoodCapacity,
  ensureCapacityCache,
  invalidateCapacityCache,
} from '../state/capacityCache.ts';
import { getOutputCapacityFactors } from './capacity.ts';
import { clampResource } from './resources.ts';
import { addResource, consumeResource } from './resourceOps.ts';
import { setOfflineReason } from './powerHandling.ts';
import { getTypeOrderIndex } from './power.ts';
import type {
  GameState,
  BuildingEntry,
  ResourceState,
} from '../state/useGame.tsx';
import type { RoleBonusMap } from './settlers.ts';

type ProdBuilding = BuildingDefinition & {
  seasonProfile?: 'constant' | Record<string, number>;
};

const RESOURCE_MAP = RESOURCES as Record<string, any>;
const ROLE_BY_RESOURCE_MAP = ROLE_BY_RESOURCE as Record<string, string>;
const BUILDING_ROLES_MAP = BUILDING_ROLES as Record<string, string>;
const ROLE_BUILDINGS_MAP = ROLE_BUILDINGS as Record<string, string[]>;


export function applyProduction(
  state: GameState,
  seconds = 1,
  roleBonuses: RoleBonusMap,
): GameState {
  ensureCapacityCache(state);
  const season = getSeason(state);
  const resources: Record<string, ResourceState> = { ...state.resources };
  const stateBuildings = state.buildings as Record<string, BuildingEntry>;
  const buildings: Record<string, BuildingEntry> = { ...stateBuildings };
  let foodPool = state.foodPool
    ? { ...state.foodPool }
    : {
        amount: Object.keys(resources).reduce(
          (sum, id) =>
            sum +
            (RESOURCE_MAP[id].category === 'FOOD'
              ? resources[id]?.amount || 0
              : 0),
          0,
        ),
        capacity: calculateFoodCapacity(state),
      };

  const active = (PRODUCTION_BUILDINGS as ProdBuilding[]).filter((b) => {
    const entry = stateBuildings[b.id];
    const count = entry?.count || 0;
    const on = entry?.isDesiredOn !== false;
    if (count <= 0 || !on) {
      if (count > 0) setOfflineReason(buildings, b.id, count, null);
      return false;
    }
    return true;
  });

  const powerOrder = state.powerTypeOrder || [];
  const generators = active.filter((b) => b.outputsPerSecBase?.power);
  const others = active.filter(
    (b) => !b.inputsPerSecBase?.power && !b.outputsPerSecBase?.power,
  );
  const consumers = active
    .filter((b) => b.inputsPerSecBase?.power)
    .sort(
      (a, b) =>
        getTypeOrderIndex(a.id, powerOrder) -
        getTypeOrderIndex(b.id, powerOrder),
    );

  let supplyTotal = 0;
  let supplyRemaining = 0;

  const runOutputs = (
    b: ProdBuilding,
    count: number,
    capFactors: Record<string, number>,
  ): void => {
    if (!b.outputsPerSecBase) return;
    Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
      if (res === 'power') return;
      const factor = capFactors[res] ?? 0;
      if (factor <= 0) return;
      const category = RESOURCE_MAP[res].category;
      let mult;
      if (b.seasonProfile === 'constant') mult = 1;
      else if (typeof b.seasonProfile === 'object')
        mult = b.seasonProfile[season.id] ?? 1;
      else mult = getSeasonMultiplier(season, category);
      const role = ROLE_BY_RESOURCE_MAP[res];
      const bonus = roleBonuses[role] || 0;
      const researchBonus = getResearchOutputBonus(state, res);
      const gain =
        base *
        mult *
        count *
        (1 + bonus + researchBonus) *
        seconds *
        factor;
      addResource(state, resources, res, gain, foodPool);
      resources[res].discovered = resources[res].discovered || count > 0;
    });
  };

  const runInputs = (
    b: ProdBuilding,
    count: number,
    capFactor: number,
  ): void => {
    if (!b.inputsPerSecBase) return;
    Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
      if (res === 'power') return;
      const amt = base * count * seconds * capFactor;
      consumeResource(state, resources, res, amt, foodPool);
    });
  };

  generators.forEach((b) => {
    const count = stateBuildings[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);

    if (b.inputsPerSecBase) {
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        if (res === 'power') continue;
        const need = base * count * seconds;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          setOfflineReason(buildings, b.id, count, 'resources');
          return;
        }
      }
      runInputs(b, count, 1);
    }

    const base = b.outputsPerSecBase?.power || 0;
    let mult;
    const category = RESOURCE_MAP.power.category;
    if (b.seasonProfile === 'constant') mult = 1;
    else if (typeof b.seasonProfile === 'object')
      mult = b.seasonProfile[season.id] ?? 1;
    else mult = getSeasonMultiplier(season, category);
    const researchBonus = getResearchOutputBonus(state, 'power');
    const gain = base * count * (1 + researchBonus) * mult * seconds;
    supplyTotal += gain;
    supplyRemaining += gain;

    const capFactors: Record<string, number> = {};
    Object.keys(b.outputsPerSecBase || {}).forEach((res) => {
      if (res !== 'power') capFactors[res] = 1;
    });
    runOutputs(b, count, capFactors);
  });

  others.forEach((b) => {
    const count = stateBuildings[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);
    const desiredOutputs = {} as Record<string, number>;
    Object.entries(b.outputsPerSecBase || {}).forEach(([res, base]) => {
      desiredOutputs[res] = base * count * seconds;
    });
    const capFactors = getOutputCapacityFactors(
      state,
      resources,
      desiredOutputs,
      foodPool.capacity,
      foodPool.amount,
    );
    const values = Object.values(capFactors);
    const runFactor = values.length > 0 ? Math.max(...values) : 1;
    if (runFactor <= 0) return;

    if (b.inputsPerSecBase) {
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        const need = base * count * seconds * runFactor;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          setOfflineReason(buildings, b.id, count, 'resources');
          return;
        }
      }
      runInputs(b, count, runFactor);
    }

    runOutputs(b, count, capFactors);
  });

  let stored = resources.power?.amount || 0;
  const capacity = getCapacity(state, 'power');
  let demandTotal = 0;

  consumers.forEach((b) => {
    const count = stateBuildings[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);
    const desiredOutputs = {} as Record<string, number>;
    Object.entries(b.outputsPerSecBase || {}).forEach(([res, base]) => {
      desiredOutputs[res] = base * count * seconds;
    });
    const capFactors = getOutputCapacityFactors(
      state,
      resources,
      desiredOutputs,
      foodPool.capacity,
      foodPool.amount,
    );
    const values = Object.values(capFactors);
    const runFactor = values.length > 0 ? Math.max(...values) : 1;
    if (runFactor <= 0) return;

    if (b.inputsPerSecBase) {
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        if (res === 'power') continue;
        const need = base * count * seconds * runFactor;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          setOfflineReason(buildings, b.id, count, 'resources');
          return;
        }
      }
    }

    const powerNeed =
      (b.inputsPerSecBase?.power || 0) * count * seconds * runFactor;
    demandTotal += powerNeed;
    let available = supplyRemaining + stored;
    if (available >= powerNeed) {
      if (supplyRemaining >= powerNeed) supplyRemaining -= powerNeed;
      else {
        const fromStored = powerNeed - supplyRemaining;
        supplyRemaining = 0;
        stored -= fromStored;
      }
      runInputs(b, count, runFactor);
      runOutputs(b, count, capFactors);
    } else {
      setOfflineReason(buildings, b.id, count, 'power');
    }
  });

  stored = clampResource(stored + supplyRemaining, capacity);
  const powerEntry = resources.power || { amount: 0, discovered: false };
  resources.power = {
    ...powerEntry,
    amount: stored,
    discovered: powerEntry.discovered || stored > 0,
    produced: (powerEntry.produced || 0) + Math.max(0, supplyTotal),
  };

  Object.keys(resources).forEach((res) => {
    const entry = resources[res];
    if (entry.amount > 0) entry.discovered = true;
  });

  const powerStatus = { supply: supplyTotal, demand: demandTotal, stored, capacity };
  return {
    ...state,
    resources,
    buildings: buildings as GameState['buildings'],
    powerStatus,
    foodPool,
  } as GameState;
}

export function processTick(
  state: GameState,
  seconds = 1,
  roleBonuses: RoleBonusMap,
): GameState {
  return applyProduction(state, seconds, roleBonuses);
}

export function buildBuilding(state: any, buildingId: string): any {
  invalidateCapacityCache();
  const blueprint = BUILDING_MAP[buildingId];
  if (!blueprint) return state;
  const count = state.buildings?.[buildingId]?.count || 0;
  const cost = getBuildingCost(blueprint, count);
  const resources: Record<string, ResourceState> = { ...state.resources };
  let foodPool = state.foodPool
    ? { ...state.foodPool }
    : {
        amount: Object.keys(state.resources || {}).reduce(
          (sum, id) =>
            sum +
            (RESOURCE_MAP[id].category === 'FOOD'
              ? state.resources[id]?.amount || 0
              : 0),
          0,
        ),
        capacity: calculateFoodCapacity(state),
      };
  for (const [res, amt] of Object.entries(cost)) {
    if ((resources[res]?.amount || 0) < amt) return state;
  }
  Object.entries(cost).forEach(([res, amt]) => {
    consumeResource(state, resources, res, amt, foodPool);
  });
  const buildings: Record<string, BuildingEntry> = {
    ...state.buildings,
    [buildingId]: { count: count + 1 },
  };
  const newState: GameState = { ...state, buildings: buildings as GameState['buildings'] };
  ensureCapacityCache(newState);
  Object.keys(resources).forEach((res) => {
    addResource(newState, resources, res, 0, foodPool);
  });
  if (blueprint.capacityAdd?.FOOD) {
    const capacity = calculateFoodCapacity(newState);
    foodPool = { amount: Math.min(foodPool.amount, capacity), capacity };
  }
  return {
    ...newState,
    resources,
    ...(foodPool ? { foodPool } : {}),
  };
}

export function demolishBuilding(state: any, buildingId: string): any {
  invalidateCapacityCache();
  const blueprint = BUILDING_MAP[buildingId];
  const count = state.buildings?.[buildingId]?.count || 0;
  if (!blueprint || count <= 0) return state;
  const prevCost = getBuildingCost(blueprint, count - 1);
  const refundRate = blueprint.refund ?? 0;
  const buildings: Record<string, BuildingEntry> = {
    ...state.buildings,
    [buildingId]: { count: count - 1 },
  };
  const resources: Record<string, ResourceState> = { ...state.resources };
  let foodPool = state.foodPool
    ? { ...state.foodPool }
    : {
        amount: Object.keys(state.resources || {}).reduce(
          (sum, id) =>
            sum +
            (RESOURCE_MAP[id].category === 'FOOD'
              ? state.resources[id]?.amount || 0
              : 0),
          0,
        ),
        capacity: calculateFoodCapacity(state),
      };
  const newState: GameState = { ...state, buildings: buildings as GameState['buildings'] };
  ensureCapacityCache(newState);
  foodPool.capacity = calculateFoodCapacity(newState);
  Object.entries(prevCost).forEach(([res, amt]) => {
    const refund = Math.floor(amt * refundRate);
    addResource(newState, resources, res, refund, foodPool);
  });
  Object.keys(resources).forEach((res) => {
    addResource(newState, resources, res, 0, foodPool);
  });
  let settlers = state.population?.settlers || [];
  const role = BUILDING_ROLES_MAP[buildingId];
  if (role) {
    const relevant = ROLE_BUILDINGS_MAP[role].filter((b) => b !== buildingId);
    const hasOther = relevant.some((b) => (buildings[b]?.count || 0) > 0);
    if ((buildings[buildingId]?.count || 0) <= 0 && !hasOther) {
      settlers = settlers.map((s: any) =>
        s.role === role ? { ...s, role: null } : s,
      );
    }
  }
  if (blueprint.capacityAdd?.FOOD) {
    foodPool.capacity = calculateFoodCapacity(newState);
    Object.keys(resources).forEach((res) => {
      if (RESOURCE_MAP[res].category === 'FOOD') {
        addResource(newState, resources, res, 0, foodPool);
      }
    });
  }
  return {
    ...newState,
    resources,
    population: { ...state.population, settlers },
    ...(foodPool ? { foodPool } : {}),
  };
}
