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
import { setPowerStatus } from './powerHandling.js';

export function applyProduction(state, seconds = 1, roleBonuses = {}) {
  const season = getSeason(state);
  const resources = { ...state.resources };
  const buildings = { ...state.buildings };
  PRODUCTION_BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count <= 0) return;
    let factor = 1;
    let powerShortage = false;
    if (b.inputsPerSecBase) {
      if (b.type === 'processing') {
        let missingPower = false;
        const canRun = Object.entries(b.inputsPerSecBase).every(
          ([res, base]) => {
            const need = base * count * seconds;
            const have = resources[res]?.amount || 0;
            const enough = have >= need;
            if (res === 'power' && !enough) missingPower = true;
            return enough;
          },
        );
        if (!canRun) {
          setPowerStatus(buildings, b.id, count, missingPower);
          return;
        }
        setPowerStatus(buildings, b.id, count, false);
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const amt = base * count * seconds;
          const capacity = getCapacity(state, res);
          const entryRes = resources[res] || { amount: 0, discovered: false };
          const next = clampResource(entryRes.amount - amt, capacity);
          resources[res] = {
            ...entryRes,
            amount: next,
            discovered: entryRes.discovered || next > 0,
          };
        });
        factor = 1;
      } else {
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const need = base * count * seconds;
          const have = resources[res]?.amount || 0;
          const ratio = need > 0 ? have / need : 1;
          if (res === 'power' && ratio < 1) powerShortage = true;
          factor = Math.min(factor, ratio);
        });
        if (b.inputsPerSecBase.power && powerShortage) {
          factor = 0;
        } else {
          factor = Math.min(1, factor);
        }
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const amt = base * count * seconds * factor;
          const capacity = getCapacity(state, res);
          const entryRes = resources[res] || { amount: 0, discovered: false };
          const next = clampResource(entryRes.amount - amt, capacity);
          resources[res] = {
            ...entryRes,
            amount: next,
            discovered: entryRes.discovered || next > 0,
          };
        });
        setPowerStatus(buildings, b.id, count, powerShortage);
      }
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
          factor;
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
  });
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
