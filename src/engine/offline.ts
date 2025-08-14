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

  const CHUNK_SECONDS = 60;
  for (let remaining = elapsedSeconds; remaining > 0; ) {
    const dt = Math.min(CHUNK_SECONDS, remaining);
    remaining -= dt;

    current = processTick(current, dt, productionBonuses);
    if (dt > 0 && current.powerStatus) {
      current.powerStatus = {
        ...current.powerStatus,
        supply: current.powerStatus.supply / dt,
        demand: current.powerStatus.demand / dt,
      };
    }

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
      dt,
      bonusFoodPerSec,
      rng,
      roleBonuses,
    );
    current = settlersResult.state;
    if (settlersResult.events?.length) events.push(...settlersResult.events);

    const { candidate, radioTimer } = updateRadio(current, dt);
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
