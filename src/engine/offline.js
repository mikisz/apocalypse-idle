import { RESOURCES } from '../data/resources.js';
import { BALANCE } from '../data/balance.js';
import { getResourceRates } from '../state/selectors.js';
import { updateRadio } from './radio.js';
import { deepClone } from '../utils/clone.ts';
import { processSettlersTick } from './settlers.js';
import { processTick } from './production.js';

const MAX_CHUNK_SECONDS = 60 * 60; // 1 hour

export function applyOfflineProgress(state, elapsedSeconds, roleBonuses = {}) {
  if (elapsedSeconds <= 0) return { state, gains: {}, events: [] };
  const before = deepClone(state.resources);
  const productionBonuses = { ...roleBonuses };
  delete productionBonuses.farmer;
  let current = { ...state };
  let events = [];
  let remaining = elapsedSeconds;

  while (remaining > 0) {
    const rates = getResourceRates(current);
    let totalFoodProdBase = 0;
    Object.keys(RESOURCES).forEach((id) => {
      if (RESOURCES[id].category === 'FOOD') {
        totalFoodProdBase += rates[id]?.perSec || 0;
      }
    });
    const bonusFoodPerSecBase =
      totalFoodProdBase * ((roleBonuses['farmer'] || 0) / 100);

    const settlers = current.population?.settlers?.filter((s) => !s.isDead)
      .length || 0;
    const consumption = settlers * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
    const netFoodPerSec =
      totalFoodProdBase + bonusFoodPerSecBase - consumption;

    const foodAmount =
      current.foodPool?.amount ??
      Object.keys(current.resources).reduce(
        (sum, id) =>
          sum +
          (RESOURCES[id].category === 'FOOD'
            ? current.resources[id]?.amount || 0
            : 0),
        0,
      );

    let chunk = Math.min(remaining, MAX_CHUNK_SECONDS);
    if (settlers > 0) {
      if (foodAmount > 0 && netFoodPerSec < 0) {
        const timeToDepletion = foodAmount / -netFoodPerSec;
        chunk = Math.min(chunk, timeToDepletion);
      } else if (foodAmount <= 0) {
        const starvationTimer = current.colony?.starvationTimerSeconds || 0;
        const timeToDeath =
          BALANCE.STARVATION_DEATH_TIMER_SECONDS - starvationTimer;
        chunk = Math.min(chunk, timeToDeath);
      }
    }

    current = processTick(current, chunk, productionBonuses);
    if (current.powerStatus) {
      current.powerStatus = {
        ...current.powerStatus,
        supply: current.powerStatus.supply / chunk,
        demand: current.powerStatus.demand / chunk,
      };
    }
    const ratesAfter = getResourceRates(current);
    let totalFoodProdAfter = 0;
    Object.keys(RESOURCES).forEach((id) => {
      if (RESOURCES[id].category === 'FOOD') {
        totalFoodProdAfter += ratesAfter[id]?.perSec || 0;
      }
    });
    const bonusFoodPerSec =
      totalFoodProdAfter * ((roleBonuses['farmer'] || 0) / 100);
    const settlersResult = processSettlersTick(
      current,
      chunk,
      bonusFoodPerSec,
      Math.random,
      roleBonuses,
    );
    current = settlersResult.state;
    if (settlersResult.events?.length) events.push(...settlersResult.events);
    const { candidate, radioTimer } = updateRadio(current, chunk);
    current = {
      ...current,
      population: { ...current.population, candidate },
      colony: { ...current.colony, radioTimer },
    };

    remaining -= chunk;
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
