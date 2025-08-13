import {
  PRODUCTION_BUILDINGS,
  BUILDING_MAP,
  getBuildingCost,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { ROLE_BY_RESOURCE, BUILDING_ROLES } from '../data/roles.js';
import { getSeason, getSeasonMultiplier } from './time.js';
import { getCapacity, getResearchOutputBonus } from '../state/selectors.js';
import { clampResource } from './resources.js';
import { setOfflineReason } from './powerHandling.js';
import { getTypeOrderIndex } from './power.js';

function getOutputCapacityFactor(state, resources, outputs = {}, count, seconds) {
  let f = 1;
  Object.entries(outputs).forEach(([res, base]) => {
    const capacity = getCapacity(state, res);
    if (!Number.isFinite(capacity)) return;
    const current = resources[res]?.amount || 0;
    const room = capacity - current;
    if (room <= 0) {
      f = 0;
      return;
    }
    const maxGain = base * count * seconds;
    if (maxGain > 0) {
      f = Math.min(f, room / maxGain);
    }
  });
  return Math.max(0, Math.min(1, f));
}

export function applyProduction(state, seconds = 1, roleBonuses = {}) {
  const season = getSeason(state);
  const resources = { ...state.resources };
  const buildings = { ...state.buildings };

  const active = PRODUCTION_BUILDINGS.filter((b) => {
    const entry = state.buildings?.[b.id];
    const count = entry?.count || 0;
    const on = entry?.isDesiredOn !== false;
    if (count <= 0 || !on) {
      if (count > 0) setOfflineReason(buildings, b.id, count, null);
      return false;
    }
    return true;
  });

  const powerOrder = state.powerTypeOrder || [];
  const consumers = active
    .filter((b) => b.inputsPerSecBase?.power)
    .sort(
      (a, b) =>
        getTypeOrderIndex(a.id, powerOrder) -
        getTypeOrderIndex(b.id, powerOrder),
    );
  const nonConsumers = active.filter((b) => !b.inputsPerSecBase?.power);

  const process = (b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);

    const capFactor = getOutputCapacityFactor(
      state,
      resources,
      b.outputsPerSecBase,
      count,
      seconds,
    );
    if (capFactor <= 0) return;

    if (b.inputsPerSecBase) {
      let shortage = null;
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        const need = base * count * seconds * capFactor;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          shortage = res === 'power' ? 'power' : 'resources';
          break;
        }
      }
      if (shortage) {
        setOfflineReason(buildings, b.id, count, shortage);
        return;
      }
      Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
        const amt = base * count * seconds * capFactor;
        const capacity = getCapacity(state, res);
        const entryRes = resources[res] || { amount: 0, discovered: false };
        const next = clampResource(entryRes.amount - amt, capacity);
        resources[res] = {
          ...entryRes,
          amount: next,
          discovered: entryRes.discovered || next > 0,
        };
      });
    }

    if (b.outputsPerSecBase) {
      Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
        const category = RESOURCES[res].category;
        let mult;
        if (b.seasonProfile === 'constant') mult = 1;
        else if (typeof b.seasonProfile === 'object')
          mult = b.seasonProfile[season.id] ?? 1;
        else mult = getSeasonMultiplier(season, category);
        const role = ROLE_BY_RESOURCE[res];
        const bonusPercent = roleBonuses[role] || 0;
        const researchBonus = getResearchOutputBonus(state, res);
        const gain =
          base *
          mult *
          count *
          (1 + bonusPercent / 100 + researchBonus) *
          seconds *
          capFactor;
        const capacity = getCapacity(state, res);
        const currentEntry = resources[res] || { amount: 0, discovered: false };
        const next = clampResource(currentEntry.amount + gain, capacity);
        resources[res] = {
          amount: next,
          discovered: currentEntry.discovered || count > 0 || next > 0,
          produced: (currentEntry.produced || 0) + Math.max(0, gain),
        };
      });
    }
  };

  nonConsumers.forEach(process);
  consumers.forEach(process);
  Object.keys(resources).forEach((res) => {
    const entry = resources[res];
    if (entry.amount > 0) entry.discovered = true;
  });
  return { ...state, resources, buildings };
}

export function processTick(state, seconds = 1, roleBonuses = {}) {
  return applyProduction(state, seconds, roleBonuses);
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
      produced: currentEntry.produced || 0,
    };
  });
  Object.keys(resources).forEach((res) => {
    const capacity = getCapacity({ ...state, buildings }, res);
    const entry = resources[res];
    entry.amount = clampResource(entry.amount, capacity);
    if (entry.amount > 0) entry.discovered = true;
  });
  let settlers = state.population?.settlers || [];
  if ((buildings[buildingId]?.count || 0) <= 0) {
    const role = BUILDING_ROLES[buildingId];
    if (role) {
      settlers = settlers.map((s) =>
        s.role === role ? { ...s, role: null } : s,
      );
    }
  }
  return {
    ...state,
    resources,
    buildings,
    population: { ...state.population, settlers },
  };
}
