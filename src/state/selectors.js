import {
  BUILDINGS,
  PRODUCTION_BUILDINGS,
  getBuildingCost,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { RESEARCH_MAP } from '../data/research.js';
import { getSeason, getSeasonMultiplier } from '../engine/time.ts';
import { computeRoleBonuses } from '../engine/settlers.ts';
import { formatRate } from '../utils/format.js';
import { BALANCE } from '../data/balance.js';
import { ROLE_BY_RESOURCE } from '../data/roles.js';
import { SHELTER_MAX } from '../data/settlement.js';
import { getCapacity, calculateFoodCapacity } from './capacityCache.ts';
export { getCapacity, calculateFoodCapacity } from './capacityCache.ts';
import { getOutputCapacityFactors } from '../engine/capacity.ts';

/** @typedef {import('./useGame.tsx').GameState} GameState */

export function getFoodPoolAmount(state) {
  if (state.foodPool?.amount != null) return state.foodPool.amount;
  return Object.keys(RESOURCES).reduce((sum, id) => {
    if (RESOURCES[id].category === 'FOOD') {
      sum += state.resources?.[id]?.amount || 0;
    }
    return sum;
  }, 0);
}

/**
 * @param {GameState} state
 */
export function getSettlerCapacity(state) {
  const count = state.buildings?.shelter?.count || 0;
  return Math.min(count, SHELTER_MAX);
}

/**
 * @param {GameState} state
 */
export function getPowerStatus(state) {
  const stored =
    state.powerStatus?.stored ?? state.resources?.power?.amount ?? 0;
  const capacity = state.powerStatus?.capacity ?? getCapacity(state, 'power');
  const supply = state.powerStatus?.supply ?? 0;
  const demand = state.powerStatus?.demand ?? 0;
  return { supply, demand, stored, capacity };
}

/**
 * @param {GameState} state
 * @param {any} building
 */
export function getBuildingCostEntries(state, building) {
  const count = state.buildings?.[building.id]?.count || 0;
  const scaledCost = getBuildingCost(building, count);
  return Object.entries(scaledCost);
}

/**
 * @param {GameState} state
 * @param {any} building
 */
export function canAffordBuilding(state, building) {
  return getBuildingCostEntries(state, building).every(
    ([res, amt]) => (state.resources[res]?.amount || 0) >= amt,
  );
}

/**
 * @param {GameState} state
 * @param {any} building
 */
export function getBuildingOutputs(state, building) {
  const season = getSeason(state);
  return Object.entries(building.outputsPerSecBase || {}).map(([res, base]) => {
    let mult;
    if (building.seasonProfile === 'constant') mult = 1;
    else if (typeof building.seasonProfile === 'object')
      mult = building.seasonProfile[season.id] ?? 1;
    else mult = getSeasonMultiplier(season, RESOURCES[res].category);
    return { res, perSec: base * mult };
  });
}

/**
 * @param {GameState} state
 * @param {any} building
 */
export function getBuildingInputs(state, building) {
  return Object.entries(building.inputsPerSecBase || {}).map(([res, base]) => ({
    res,
    perSec: base,
  }));
}

/**
 * @param {GameState} state
 * @param {Record<string, number>} roleBonuses
 * @returns {Record<string, number>}
 */
function getOutputCapacityFactorRates(
  state,
  resources,
  outputs = {},
  count,
  factor,
  foodCapacity,
  totalFoodAmount,
) {
  const desired = {};
  Object.entries(outputs || {}).forEach(([res, base]) => {
    desired[res] = base * count * factor;
  });
  const capFactors = getOutputCapacityFactors(
    state,
    resources,
    desired,
    foodCapacity,
    totalFoodAmount,
  );
  const perRes = {};
  let max = 0;
  Object.entries(capFactors).forEach(([res, cf]) => {
    perRes[res] = cf * factor;
    if (cf > max) max = cf;
  });
  if (!Object.keys(capFactors).length) max = 1;
  return { factor: factor * max, perRes };
}

function aggregateBuildingRates(state, roleBonuses) {
  const season = getSeason(state);
  const rates = {};
  const resources = {};
  Object.keys(state.resources || {}).forEach((id) => {
    resources[id] = state.resources[id]?.amount || 0;
  });
  let totalFoodAmount =
    state.foodPool?.amount ??
    Object.keys(resources).reduce(
      (sum, id) =>
        sum + (RESOURCES[id].category === 'FOOD' ? resources[id] : 0),
      0,
    );
  const foodCapacity =
    state.foodPool?.capacity ?? calculateFoodCapacity(state);
  PRODUCTION_BUILDINGS.forEach((b) => {
    const entry = state.buildings?.[b.id];
    const count = entry?.count || 0;
    const on = entry?.isDesiredOn !== false;
    if (count <= 0 || !on) return;
    let factor = 1;
    let perRes = {};
    if (b.inputsPerSecBase) {
      if (b.type === 'processing') {
        const res = getOutputCapacityFactorRates(
          state,
          resources,
          b.outputsPerSecBase,
          count,
          factor,
          foodCapacity,
          totalFoodAmount,
        );
        factor = res.factor;
        perRes = res.perRes;
        if (factor <= 0) return;
        const canRun = Object.entries(b.inputsPerSecBase).every(
          ([resId, base]) => {
            const need = base * count * factor;
            const have = resources[resId] || 0;
            return have >= need;
          },
        );
        if (!canRun) return;
        Object.entries(b.inputsPerSecBase).forEach(([resId, base]) => {
          const amt = base * count * factor;
          rates[resId] = (rates[resId] || 0) - amt;
          resources[resId] = (resources[resId] || 0) - amt;
          if (RESOURCES[resId].category === 'FOOD') totalFoodAmount -= amt;
        });
      } else {
        Object.entries(b.inputsPerSecBase).forEach(([resId, base]) => {
          const need = base * count;
          const have = resources[resId] || 0;
          const ratio = need > 0 ? have / need : 1;
          factor = Math.min(factor, ratio);
        });
        const res = getOutputCapacityFactorRates(
          state,
          resources,
          b.outputsPerSecBase,
          count,
          factor,
          foodCapacity,
          totalFoodAmount,
        );
        factor = res.factor;
        perRes = res.perRes;
        if (factor <= 0) return;
        Object.entries(b.inputsPerSecBase).forEach(([resId, base]) => {
          const amt = base * count * factor;
          rates[resId] = (rates[resId] || 0) - amt;
          resources[resId] = (resources[resId] || 0) - amt;
          if (RESOURCES[resId].category === 'FOOD') totalFoodAmount -= amt;
        });
      }
    } else {
      const res = getOutputCapacityFactorRates(
        state,
        resources,
        b.outputsPerSecBase,
        count,
        factor,
        foodCapacity,
        totalFoodAmount,
      );
      factor = res.factor;
      perRes = res.perRes;
      if (factor <= 0) return;
    }
    if (b.outputsPerSecBase) {
      Object.entries(b.outputsPerSecBase).forEach(([resId, base]) => {
        const factorRes = perRes[resId] ?? 0;
        if (factorRes <= 0) return;
        const category = RESOURCES[resId].category;
        let mult;
        if (b.seasonProfile === 'constant') mult = 1;
        else if (typeof b.seasonProfile === 'object')
          mult = b.seasonProfile[season.id] ?? 1;
        else mult = getSeasonMultiplier(season, category);
        const role = ROLE_BY_RESOURCE[resId];
        const bonus = roleBonuses[role] || 0;
        const researchBonus = getResearchOutputBonus(state, resId);
        let gain =
          base *
          mult *
          count *
          (1 + bonus + researchBonus) *
          factorRes;
        if (category === 'FOOD') {
          const room = foodCapacity - totalFoodAmount;
          gain = room > 0 ? Math.min(gain, room) : 0;
          totalFoodAmount += gain;
        } else {
          const cap = getCapacity(state, resId);
          if (Number.isFinite(cap)) {
            const current = resources[resId] || 0;
            const room = cap - current;
            gain = room > 0 ? Math.min(gain, room) : 0;
          }
        }
        rates[resId] = (rates[resId] || 0) + gain;
        resources[resId] = (resources[resId] || 0) + gain;
      });
    }
  });
  return rates;
}

/**
 * @param {GameState} state
 * @param {Record<string, number>} rates
 */
function applyConsumption(state, rates) {
  const settlers =
    state.population?.settlers?.filter((s) => !s.isDead)?.length || 0;
  const consumption = settlers * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
  rates.potatoes = (rates.potatoes || 0) - consumption;
}

/**
 * @param {Record<string, number>} rates
 * @returns {Record<string, {perSec:number,label:string}>}
 */
function formatRates(rates) {
  const formatted = {};
  Object.keys(RESOURCES).forEach((id) => {
    const perSec = rates[id] || 0;
    formatted[id] = { perSec, label: formatRate(perSec) };
  });
  return formatted;
}

/**
 * @param {GameState} state
 * @param {boolean} [includeConsumption=false]
 * @param {Record<string, number>} [roleBonuses={}]
 * @returns {Record<string, {perSec:number,label:string}>}
 */
export function getResourceRates(
  state,
  includeConsumption = false,
  roleBonuses = {},
) {
  const rates = aggregateBuildingRates(state, roleBonuses);
  if (includeConsumption) applyConsumption(state, rates);
  return formatRates(rates);
}

function gatherEffects(state, type) {
  const completed = state.research?.completed || [];
  const effects = [];
  completed.forEach((id) => {
    const r = RESEARCH_MAP[id];
    if (!r?.effects) return;
    const list = Array.isArray(r.effects) ? r.effects : [r.effects];
    list.forEach((e) => {
      if (!type || e.type === type || (!e.type && type === 'output')) {
        effects.push(e);
      }
    });
  });
  return effects;
}

function effectApplies(e, resId) {
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

export function getResearchOutputBonus(state, resId) {
  let bonus = 0;
  gatherEffects(state, 'output').forEach((e) => {
    if (effectApplies(e, resId)) bonus += e.percent || 0;
  });
  return bonus;
}

export function getResearchStorageBonus(state, resId) {
  let bonus = 0;
  gatherEffects(state, 'storage').forEach((e) => {
    if (effectApplies(e, resId)) bonus += e.percent || 0;
  });
  return bonus;
}

const CATEGORY_LABELS = {
  FOOD: 'Food',
  RAW: 'Raw Materials',
  SOCIETY: 'Science',
  CONSTRUCTION_MATERIALS: 'Construction Materials',
  ENERGY: 'Energy',
};

/**
 * @param {GameState} state
 * @param {Record<string,{perSec:number,label:string}>} netRates
 * @param {Record<string,{perSec:number,label:string}>} prodRates
 * @returns {{groups: Record<string, any[]>, foodIds: string[]}}
 */
function buildResourceGroups(state, netRates, prodRates) {
  const groups = {};
  const foodIds = [];
  const powerStatus = getPowerStatus(state);
  Object.values(RESOURCES).forEach((r) => {
    if (
      r.id === 'power' &&
      !(state.research?.completed || []).includes('basicEnergy')
    )
      return;
    const isPower = r.id === 'power';
    const amount = isPower
      ? powerStatus.stored
      : state.resources[r.id]?.amount || 0;
    const isFood = r.category === 'FOOD';
    const capacity = isFood
      ? null
      : isPower
        ? powerStatus.capacity
        : getCapacity(state, r.id);
    if (isFood) foodIds.push(r.id);
    const rateInfo = (isFood ? prodRates : netRates)[r.id];
    const discovered = state.resources[r.id]?.discovered;
    if (rateInfo.perSec !== 0 || amount > 0 || discovered) {
      if (!groups[r.category]) groups[r.category] = [];
      const capped = capacity != null && amount >= capacity;
      const item = {
        id: r.id,
        name: r.name,
        icon: r.icon,
        amount,
        capacity,
        capped,
        rate: rateInfo.label,
        tooltip: undefined,
      };
      if (isPower) {
        item.supply = powerStatus.supply;
        item.demand = powerStatus.demand;
        item.tooltip = `Supply: ${formatRate(powerStatus.supply)}\nDemand: ${formatRate(powerStatus.demand)}\nPower is generated by Energy buildings and stored in Batteries. Excess above capacity is lost.`;
      }
      groups[r.category].push(item);
    }
  });
  return { groups, foodIds };
}

/**
 * @param {GameState} state
 * @param {string[]} foodIds
 * @param {Record<string,{perSec:number,label:string}>} netRates
 */
function createFoodTotalRow(state, foodIds, netRates) {
  const totalAmount = state.foodPool?.amount || 0;
  const totalCapacity = state.foodPool?.capacity || 0;
  const totalNetRate = foodIds.reduce(
    (sum, id) => sum + (netRates[id]?.perSec || 0),
    0,
  );
  return {
    id: 'food-total',
    name: 'Total',
    amount: totalAmount,
    capacity: totalCapacity,
    rate: formatRate(totalNetRate),
  };
}

/**
 * @param {GameState} state
 */
export function getResourceSections(state) {
  const settlers = state.population?.settlers?.filter((s) => !s.isDead) || [];
  const roleBonuses = computeRoleBonuses(settlers);
  const netRates = getResourceRates(state, true, roleBonuses);
  const prodRates = getResourceRates(state, false, roleBonuses);

  const { groups, foodIds } = buildResourceGroups(state, netRates, prodRates);

  if (groups.FOOD) {
    const totalRow = createFoodTotalRow(state, foodIds, netRates);
    groups.FOOD = [totalRow, ...groups.FOOD];
  }

  return Object.entries(groups).map(([cat, items]) => ({
    id: cat,
    title: CATEGORY_LABELS[cat] || cat,
    items,
    defaultOpen: true,
  }));
}
