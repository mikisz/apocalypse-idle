import { BUILDINGS, PRODUCTION_BUILDINGS } from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
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
  return base + fromBuildings;
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
    Object.entries(b.outputsPerSecBase).forEach(([res, base]) => {
      const category = RESOURCES[res].category;
      const mult = getSeasonMultiplier(season, category);
      const role = ROLE_BY_RESOURCE[res];
      const bonusPercent = roleBonuses[role] || 0;
      const perSec = base * mult * count * (1 + bonusPercent / 100);
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
