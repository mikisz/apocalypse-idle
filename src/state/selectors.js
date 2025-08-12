import { BUILDINGS, PRODUCTION_BUILDINGS } from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { RESEARCH_MAP } from '../data/research.js';
import { getSeason, getSeasonMultiplier } from '../engine/time.js';
import { formatRate } from '../utils/format.js';
import { BALANCE } from '../data/balance.js';
import { ROLE_BY_RESOURCE } from '../data/roles.js';

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

export function getResourceRates(
  state,
  includeConsumption = false,
  roleBonuses = {},
) {
  const season = getSeason(state);
  const rates = {};
  PRODUCTION_BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0;
    if (count <= 0) return;
    let factor = 1;
    if (b.inputsPerSecBase) {
      if (b.type === 'processing') {
        const canRun = Object.entries(b.inputsPerSecBase).every(([res, base]) => {
          const need = base * count;
          const have = state.resources[res]?.amount || 0;
          return have >= need;
        });
        if (!canRun) return;
        Object.entries(b.inputsPerSecBase).forEach(([res, base]) => {
          const amt = base * count;
          rates[res] = (rates[res] || 0) - amt;
        });
        factor = 1;
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
    Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
      const category = RESOURCES[res].category;
      const mult = getSeasonMultiplier(season, category);
      const role = ROLE_BY_RESOURCE[res];
      const bonusPercent = roleBonuses[role] || 0;
      const researchBonus = getResearchOutputBonus(state, res);
      const perSec =
        base * mult * count * (1 + bonusPercent / 100 + researchBonus) * factor;
      rates[res] = (rates[res] || 0) + perSec;
    });
  });

  if (includeConsumption) {
    const settlers =
      state.population?.settlers?.filter((s) => !s.isDead)?.length || 0;
    const consumption = settlers * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
    rates.potatoes = (rates.potatoes || 0) - consumption;
  }

  const formatted = {};
  Object.keys(RESOURCES).forEach((id) => {
    const perSec = rates[id] || 0;
    formatted[id] = { perSec, label: formatRate(perSec) };
  });
  return formatted;
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
