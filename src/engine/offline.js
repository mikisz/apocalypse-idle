import { RESOURCES } from '../data/resources.js';
import { getResourceRates } from '../state/selectors.js';
import { updateRadio } from './radio.js';
import { deepClone } from '../utils/clone.ts';
import { processSettlersTick } from './settlers.js';
import { applyProduction } from './production.js';

export function applyOfflineProgress(state, elapsedSeconds, roleBonuses = {}) {
  if (elapsedSeconds <= 0) return { state, gains: {}, events: [] };
  const before = deepClone(state.resources);
  const productionBonuses = { ...roleBonuses };
  delete productionBonuses.farmer;
  let current = applyProduction({ ...state }, elapsedSeconds, productionBonuses);
  const rates = getResourceRates(current);
  let totalFoodProdBase = 0;
  Object.keys(RESOURCES).forEach((id) => {
    if (RESOURCES[id].category === 'FOOD') {
      totalFoodProdBase += rates[id]?.perSec || 0;
    }
  });
  const bonusFoodPerSec =
    totalFoodProdBase * ((roleBonuses['farmer'] || 0) / 100);
  const { state: afterSettlers, events } = processSettlersTick(
    current,
    elapsedSeconds,
    bonusFoodPerSec,
    Math.random,
    roleBonuses,
  );
  current = afterSettlers;
  Object.keys(current.resources).forEach((res) => {
    if (current.resources[res].amount > 0)
      current.resources[res].discovered = true;
  });
  const { candidate, radioTimer } = updateRadio(current, elapsedSeconds);
  current = {
    ...current,
    population: { ...current.population, candidate },
    colony: { ...current.colony, radioTimer },
  };
  const gains = {};
  Object.keys(before).forEach((res) => {
    const gain =
      (current.resources[res]?.amount || 0) - (before[res]?.amount || 0);
    if (gain > 0) gains[res] = gain;
  });
  return {
    state: current,
    gains,
    events,
  };
}
