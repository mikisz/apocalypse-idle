// @ts-nocheck
import { RESOURCES } from '../data/resources.js';
import { getResourceRates } from '../state/selectors.js';
import { updateRadio } from './radio.ts';
import { deepClone } from '../utils/clone.ts';
import { processSettlersTick } from './settlers.ts';
import { processTick } from './production.ts';

export function applyOfflineProgress(
  state: any,
  elapsedSeconds: number,
  roleBonuses: Record<string, number> = {},
  rng: () => number = Math.random,
): { state: any; gains: Record<string, number>; events: any[] } {
  if (elapsedSeconds <= 0) return { state, gains: {}, events: [] };
  const before = deepClone(state.resources);
  const productionBonuses = { ...roleBonuses };
  delete productionBonuses.farmer;
  let current: any = { ...state };
  let events: any[] = [];

  for (let i = 0; i < elapsedSeconds; i += 1) {
    current = processTick(current, 1, productionBonuses);
    const rates = getResourceRates(current);
    let totalFoodProdBase = 0;
    Object.keys(RESOURCES).forEach((id) => {
      if (RESOURCES[id].category === 'FOOD') {
        totalFoodProdBase += rates[id]?.perSec || 0;
      }
    });
    const bonusFoodPerSec =
      totalFoodProdBase * (roleBonuses['farmer'] || 0);
    const settlersResult = processSettlersTick(
      current,
      1,
      bonusFoodPerSec,
      rng,
      roleBonuses,
    );
    current = settlersResult.state;
    if (settlersResult.events?.length) events.push(...settlersResult.events);
    const { candidate, radioTimer } = updateRadio(current, 1);
    current = {
      ...current,
      population: { ...current.population, candidate },
      colony: { ...current.colony, radioTimer },
    };
  }

  Object.keys(current.resources).forEach((res) => {
    if (current.resources[res].amount > 0)
      current.resources[res].discovered = true;
  });
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
