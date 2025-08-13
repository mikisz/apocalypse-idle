import {
  BUILDINGS,
  PRODUCTION_BUILDINGS,
  getBuildingCost,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { RESEARCH_MAP } from '../data/research.js';
import { getSeason, getSeasonMultiplier } from '../engine/time.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { formatRate } from '../utils/format.js';
import { BALANCE } from '../data/balance.js';
import { ROLE_BY_RESOURCE } from '../data/roles.js';
import { SHELTER_MAX } from '../data/settlement.js';

/** @typedef {import('./useGame.tsx').GameState} GameState */

/**
 * @param {GameState} state
 * @param {string} resourceId
 */
export function getCapacity(state, resourceId) {
  const base = RESOURCES[resourceId]?.startingCapacity || 0;
  let fromBuildings = 0;
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count > 0 && b.capacityAdd?.[resourceId]) {
      fromBuildings += b.capacityAdd[resourceId] * count;
    }
  });
  const bonus = getResearchStorageBonus(state, resourceId);
  return Math.floor((base + fromBuildings) * (1 + bonus));
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
function aggregateBuildingRates(state, roleBonuses) {
  const season = getSeason(state);
  const rates = {};
  PRODUCTION_BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count <= 0) return;
    let factor = 1;
    if (b.inputsPerSecBase) {
      if (b.type === 'processing') {
        const canRun = Object.entries(b.inputsPerSecBase).every(
          ([res, base]) => {
            const need = base * count;
            const have = state.resources[res]?.amount || 0;
            return have >= need;
          },
        );
        if (!canRun) return;
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const amt = base * count;
          rates[res] = (rates[res] || 0) - amt;
        });
      } else {
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const need = base * count;
          const have = state.resources[res]?.amount || 0;
          const ratio = need > 0 ? have / need : 1;
          factor = Math.min(factor, ratio);
        });
        factor = Math.min(1, factor);
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const amt = base * count * factor;
          rates[res] = (rates[res] || 0) - amt;
        });
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
        const perSec =
          base *
          mult *
          count *
          (1 + bonusPercent / 100 + researchBonus) *
          factor;
        rates[res] = (rates[res] || 0) + perSec;
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
  Object.values(RESOURCES).forEach((r) => {
    if (
      r.id === 'power' &&
      !(state.research?.completed || []).includes('basicEnergy')
    )
      return;
    const amount = state.resources[r.id]?.amount || 0;
    const isFood = r.category === 'FOOD';
    const capacity = isFood ? null : getCapacity(state, r.id);
    if (isFood) foodIds.push(r.id);
    const rateInfo = (isFood ? prodRates : netRates)[r.id];
    const discovered = state.resources[r.id]?.discovered;
    if (rateInfo.perSec !== 0 || amount > 0 || discovered) {
      if (!groups[r.category]) groups[r.category] = [];
      const capped = capacity != null && amount >= capacity;
      groups[r.category].push({
        id: r.id,
        name: r.name,
        icon: r.icon,
        amount,
        capacity,
        capped,
        rate: rateInfo.label,
        tooltip:
          r.id === 'power'
            ? 'Power is generated by Energy buildings and stored in Batteries. Excess above capacity is lost.'
            : undefined,
      });
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
  const totalAmount = foodIds.reduce(
    (sum, id) => sum + (state.resources[id]?.amount || 0),
    0,
  );
  const totalCapacity =
    state.foodPool?.capacity ??
    foodIds.reduce((sum, id) => sum + getCapacity(state, id), 0);
  const totalNetRate = foodIds.reduce(
    (sum, id) => sum + (netRates[id]?.perSec || 0),
    0,
  );
  return {
    id: 'food-total',
    name: 'Total',
    amount: state.foodPool?.amount ?? totalAmount,
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
    title: CATEGORY_LABELS[cat] || cat,
    items,
    defaultOpen: true,
  }));
}
