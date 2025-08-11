import { PRODUCTION_BUILDINGS, BUILDING_MAP, getBuildingCost } from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { getSeason, getSeasonMultiplier } from './time.js';
import { getCapacity } from '../state/selectors.js';
import { BALANCE } from '../data/balance.js';

export function clampResource(value, capacity) {
  let v = Number.isFinite(value) ? value : 0;
  const c = Number.isFinite(capacity) ? Math.max(0, capacity) : 0;
  const result = Math.max(0, Math.min(c, v));
  return Math.round(result * 1e6) / 1e6;
}

export function applyProduction(state, seconds = 1) {
  const season = getSeason(state);
  const resources = { ...state.resources };
  PRODUCTION_BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count <= 0) return;
    Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
      const category = RESOURCES[res].category;
      const mult = getSeasonMultiplier(season, category);
      const gain = base * mult * count * seconds;
      const capacity = getCapacity(state, res);
      const currentEntry = resources[res] || { amount: 0, discovered: false };
      const next = clampResource(currentEntry.amount + gain, capacity);
      resources[res] = {
        amount: next,
        discovered: currentEntry.discovered || count > 0 || next > 0,
      };
    });
  });
  Object.keys(resources).forEach((res) => {
    const entry = resources[res];
    if (entry.amount > 0) entry.discovered = true;
  });
  return { ...state, resources };
}

export function processTick(state, seconds = 1) {
  return applyProduction(state, seconds);
}

export function applyOfflineProgress(state, elapsedSeconds) {
  if (elapsedSeconds <= 0) return { state, gains: {} };
  const before = JSON.parse(JSON.stringify(state.resources));
  let current = applyProduction({ ...state }, elapsedSeconds);
  const settlers = state.population?.settlers?.filter((s) => !s.isDead)?.length || 0;
  if (settlers > 0) {
    const consumption =
      settlers * BALANCE.FOOD_CONSUMPTION_PER_SETTLER * elapsedSeconds;
    const cap = getCapacity(current, 'potatoes');
    const entry = current.resources.potatoes || { amount: 0, discovered: false };
    const next = clampResource(entry.amount - consumption, cap);
    current.resources.potatoes = {
      amount: next,
      discovered: entry.discovered || next > 0,
    };
  }
  Object.keys(current.resources).forEach((res) => {
    if (current.resources[res].amount > 0) current.resources[res].discovered = true;
  });
  const gains = {};
  Object.keys(before).forEach((res) => {
    const gain = (current.resources[res]?.amount || 0) - (before[res]?.amount || 0);
    if (gain > 0) gains[res] = gain;
  });
  return { state: current, gains };
}

export function demolishBuilding(state, buildingId) {
  const blueprint = BUILDING_MAP[buildingId];
  const count = state.buildings?.[buildingId]?.count || 0;
  if (!blueprint || count <= 0) return state;
  const prevCost = getBuildingCost(blueprint, count - 1);
  const refundRate = blueprint.refund ?? 0;
  const buildings = { ...state.buildings, [buildingId]: { count: count - 1 } };
  const resources = { ...state.resources };
  Object.entries(prevCost).forEach(([res, amt]) => {
    const refund = Math.floor(amt * refundRate);
    const capacity = getCapacity({ ...state, buildings }, res);
    const currentEntry = resources[res] || { amount: 0, discovered: false };
    const next = clampResource(currentEntry.amount + refund, capacity);
    resources[res] = {
      amount: next,
      discovered: currentEntry.discovered || next > 0,
    };
  });
  Object.keys(resources).forEach((res) => {
    const capacity = getCapacity({ ...state, buildings }, res);
    const entry = resources[res];
    entry.amount = clampResource(entry.amount, capacity);
    if (entry.amount > 0) entry.discovered = true;
  });
  return { ...state, resources, buildings };
}
