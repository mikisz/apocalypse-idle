// @ts-nocheck
import { RESOURCES } from '../data/resources.js';
import { BUILDINGS } from '../data/buildings.js';
import { RESEARCH_MAP } from '../data/research.js';

interface GameState {
  resources?: Record<string, any>;
  buildings?: Record<string, any>;
  research?: any;
}

interface Effect {
  type?: string;
  percent?: number;
  category?: string;
  resource?: string;
}

let lastState: any = null;
let lastBuildingsHash = '';
let lastResearch: any = null;
let capacities: Record<string, number> = {};
let foodCapacity = 0;

function gatherStorageEffects(state: GameState): Effect[] {
  const completed = state.research?.completed || [];
  const effects: Effect[] = [];
  completed.forEach((id: string) => {
    const r = RESEARCH_MAP[id];
    if (!r?.effects) return;
    const list = Array.isArray(r.effects) ? r.effects : [r.effects];
    list.forEach((e: any) => {
      if (e.type === 'storage') effects.push(e);
    });
  });
  return effects;
}

function effectApplies(e: Effect, resId: string): boolean {
  if (e.resource && e.resource === resId) return true;
  if (e.category) {
    if (e.category === 'WOOD') return ['wood', 'planks'].includes(resId);
    if (e.category === 'SCRAP') return ['scrap', 'metalParts'].includes(resId);
    if (e.category === 'RAW') return RESOURCES[resId]?.category === 'RAW';
    if (e.category === 'CONSTRUCTION_MATERIALS')
      return RESOURCES[resId]?.category === 'CONSTRUCTION_MATERIALS';
  }
  return false;
}

function getResearchStorageBonus(state: GameState, resId: string): number {
  let bonus = 0;
  gatherStorageEffects(state).forEach((e) => {
    if (effectApplies(e, resId)) bonus += e.percent || 0;
  });
  return bonus;
}

function recompute(state: GameState) {
  capacities = {};
  Object.keys(RESOURCES).forEach((id) => {
    if (RESOURCES[id].category === 'FOOD') return;
    const base = RESOURCES[id]?.startingCapacity || 0;
    let fromBuildings = 0;
    BUILDINGS.forEach((b) => {
      const count = state.buildings?.[b.id]?.count || 0;
      if (count > 0 && b.capacityAdd?.[id]) {
        fromBuildings += b.capacityAdd[id] * count;
      }
    });
    const bonus = getResearchStorageBonus(state, id);
    capacities[id] = Math.floor((base + fromBuildings) * (1 + bonus));
  });

  foodCapacity = 0;
  Object.keys(RESOURCES).forEach((id) => {
    if (RESOURCES[id].category !== 'FOOD') return;
    const base = RESOURCES[id]?.startingCapacity || 0;
    let fromBuildings = 0;
    BUILDINGS.forEach((b) => {
      const count = state.buildings?.[b.id]?.count || 0;
      if (count > 0 && b.capacityAdd?.[id]) {
        fromBuildings += b.capacityAdd[id] * count;
      }
    });
    const bonus = getResearchStorageBonus(state, id);
    foodCapacity += Math.floor((base + fromBuildings) * (1 + bonus));
  });
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count > 0 && b.capacityAdd?.FOOD) {
      foodCapacity += b.capacityAdd.FOOD * count;
    }
  });
  lastState = state;
  lastBuildingsHash = JSON.stringify(state.buildings || {});
  lastResearch = state.research?.completed;
}

export function ensureCapacityCache(state: GameState) {
  const buildingsHash = JSON.stringify(state.buildings || {});
  if (
    state !== lastState ||
    buildingsHash !== lastBuildingsHash ||
    state.research?.completed !== lastResearch
  ) {
    recompute(state);
  }
}

export function getCapacity(state: GameState, resourceId: string): number {
  ensureCapacityCache(state);
  if (RESOURCES[resourceId]?.category === 'FOOD') return Infinity;
  return capacities[resourceId] || 0;
}

export function calculateFoodCapacity(state: GameState): number {
  ensureCapacityCache(state);
  return foodCapacity;
}

export function invalidateCapacityCache() {
  lastState = null;
  lastBuildingsHash = '';
  lastResearch = null;
}
