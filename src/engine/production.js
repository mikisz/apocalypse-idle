import {
  PRODUCTION_BUILDINGS,
  BUILDING_MAP,
  getBuildingCost,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import {
  ROLE_BY_RESOURCE,
  BUILDING_ROLES,
  ROLE_BUILDINGS,
} from '../data/roles.js';
import { getSeason, getSeasonMultiplier } from './time.js';
import {
  getCapacity,
  getFoodCapacity,
  getResearchOutputBonus,
} from '../state/selectors.js';
import { clampResource } from './resources.js';
import { setOfflineReason } from './powerHandling.js';
import { getTypeOrderIndex } from './power.js';

function getOutputCapacityFactor(
  state,
  resources,
  outputs = {},
  count,
  seconds,
  foodCapacity,
  totalFoodAmount,
) {
  let f = 1;
  Object.entries(outputs).forEach(([res, base]) => {
    if (RESOURCES[res].category === 'FOOD') {
      const room = foodCapacity - totalFoodAmount;
      if (room <= 0) {
        f = 0;
        return;
      }
      const maxGain = base * count * seconds;
      if (maxGain > 0) {
        f = Math.min(f, room / maxGain);
      }
    } else {
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
    }
  });
  return Math.max(0, Math.min(1, f));
}

export function applyProduction(state, seconds = 1, roleBonuses = {}) {
  const season = getSeason(state);
  const resources = { ...state.resources };
  const buildings = { ...state.buildings };
  let totalFoodAmount =
    state.foodPool?.amount ??
    Object.keys(resources).reduce(
      (sum, id) =>
        sum +
        (RESOURCES[id].category === 'FOOD'
          ? resources[id]?.amount || 0
          : 0),
      0,
    );
  const foodCapacity = state.foodPool?.capacity ?? getFoodCapacity(state);

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

  const runOutputs = (b, count, capFactor) => {
    if (!b.outputsPerSecBase) return;
    Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
      if (res === 'power') return;
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
      const currentEntry = resources[res] || { amount: 0, discovered: false };
      if (category === 'FOOD') {
        const room = foodCapacity - totalFoodAmount;
        const actualGain = room > 0 ? Math.min(gain, room) : 0;
        const next = currentEntry.amount + actualGain;
        totalFoodAmount += actualGain;
        resources[res] = {
          amount: next,
          discovered: currentEntry.discovered || count > 0 || next > 0,
          produced: (currentEntry.produced || 0) + Math.max(0, actualGain),
        };
      } else {
        const capacity = getCapacity(state, res);
        const next = clampResource(currentEntry.amount + gain, capacity);
        resources[res] = {
          amount: next,
          discovered: currentEntry.discovered || count > 0 || next > 0,
          produced: (currentEntry.produced || 0) + Math.max(0, gain),
        };
      }
    });
  };

  const runInputs = (b, count, capFactor) => {
    if (!b.inputsPerSecBase) return;
    Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
      if (res === 'power') return;
      const amt = base * count * seconds * capFactor;
      const entryRes = resources[res] || { amount: 0, discovered: false };
      if (RESOURCES[res].category === 'FOOD') {
        const next = Math.max(0, entryRes.amount - amt);
        const consumed = entryRes.amount - next;
        totalFoodAmount -= consumed;
        resources[res] = {
          ...entryRes,
          amount: next,
          discovered: entryRes.discovered || next > 0,
        };
      } else {
        const capacity = getCapacity(state, res);
        const next = clampResource(entryRes.amount - amt, capacity);
        resources[res] = {
          ...entryRes,
          amount: next,
          discovered: entryRes.discovered || next > 0,
        };
      }
    });
  };

  generators.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
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
    const category = RESOURCES.power.category;
    if (b.seasonProfile === 'constant') mult = 1;
    else if (typeof b.seasonProfile === 'object')
      mult = b.seasonProfile[season.id] ?? 1;
    else mult = getSeasonMultiplier(season, category);
    const researchBonus = getResearchOutputBonus(state, 'power');
    const gain = base * count * (1 + researchBonus) * mult * seconds;
    supplyTotal += gain;
    supplyRemaining += gain;

    runOutputs(b, count, 1);
  });

  others.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);
    const capFactor = getOutputCapacityFactor(
      state,
      resources,
      b.outputsPerSecBase,
      count,
      seconds,
      foodCapacity,
      totalFoodAmount,
    );
    if (capFactor <= 0) return;

    if (b.inputsPerSecBase) {
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        const need = base * count * seconds * capFactor;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          setOfflineReason(buildings, b.id, count, 'resources');
          return;
        }
      }
      runInputs(b, count, capFactor);
    }

    runOutputs(b, count, capFactor);
  });

  let stored = resources.power?.amount || 0;
  const capacity = getCapacity(state, 'power');
  let demandTotal = 0;

  consumers.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    setOfflineReason(buildings, b.id, count, null);
    const capFactor = getOutputCapacityFactor(
      state,
      resources,
      b.outputsPerSecBase,
      count,
      seconds,
      foodCapacity,
      totalFoodAmount,
    );
    if (capFactor <= 0) return;

    if (b.inputsPerSecBase) {
      for (const [res, base] of Object.entries(b.inputsPerSecBase)) {
        if (res === 'power') continue;
        const need = base * count * seconds * capFactor;
        const have = resources[res]?.amount || 0;
        if (have < need) {
          setOfflineReason(buildings, b.id, count, 'resources');
          return;
        }
      }
    }

    const powerNeed = (b.inputsPerSecBase?.power || 0) * count * seconds * capFactor;
    demandTotal += powerNeed;
    let available = supplyRemaining + stored;
    if (available >= powerNeed) {
      if (supplyRemaining >= powerNeed) supplyRemaining -= powerNeed;
      else {
        const fromStored = powerNeed - supplyRemaining;
        supplyRemaining = 0;
        stored -= fromStored;
      }
      runInputs(b, count, capFactor);
      runOutputs(b, count, capFactor);
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

  const foodPool = { amount: totalFoodAmount, capacity: foodCapacity };
  const powerStatus = { supply: supplyTotal, demand: demandTotal, stored, capacity };
  return { ...state, resources, buildings, powerStatus, foodPool };
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
  const role = BUILDING_ROLES[buildingId];
  if (role) {
    const relevant = ROLE_BUILDINGS[role].filter((b) => b !== buildingId);
    const hasOther = relevant.some((b) => (buildings[b]?.count || 0) > 0);
    if ((buildings[buildingId]?.count || 0) <= 0 && !hasOther) {
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
